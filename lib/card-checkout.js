import Stripe from "stripe";
import { problem } from "./http.js";
import { cardReady, offeringBySku, priceIdFor, stripeSecret } from "./catalog.js";
export { stripeSecret };
import { CHECKLIST_PRODUCT, TEMPLATE_VERSION, launchGuide } from "./product.js";

const ATTEMPT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function stripeClient(secret = stripeSecret()) {
  if (!secret) return null;
  return new Stripe(secret, { apiVersion: "2026-09-30.endive" });
}

export function deliverableFor(offering) {
  if (offering.sku === CHECKLIST_PRODUCT) return launchGuide();
  return [
    `Launchixis purchase record for ${offering.name} (${offering.sku}).`,
    "This record confirms the order. It is not the brand kit, operator seat, or enterprise delivery itself.",
    "Those services stay off until their delivery workflow is enabled.",
    "Card payments are taken by Stripe on the Apixis Dev LLC account. Ixis payments are taken by the Apixis Wallet.",
  ].join(" ");
}

function suffix() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function moneyLabel(object, offering) {
  const amount = object.amount_total ?? object.amount_paid;
  if (typeof amount === "number" && object.currency) {
    return `${(amount / 100).toFixed(2)} ${String(object.currency).toUpperCase()} · ${offering.name}`;
  }
  return `Card · ${offering.name}`;
}

export async function startCardCheckout({ user, attemptId, productKey, origin }, { store, stripe, env = process.env }) {
  if (!user?.email_confirmed_at || !user?.app_metadata?.apixis_sub) throw problem("Sign in with Apixis before purchasing.", 401);
  if (!ATTEMPT.test(attemptId || "")) throw problem("A valid purchase attempt is required.");
  const offering = offeringBySku(productKey);
  if (!offering) throw problem("This product is not on sale.", 409);
  if (!cardReady(offering, env) || !stripe) throw problem("Card checkout is not available for this product.", 409);
  const priceId = priceIdFor(offering, env);
  const price = await stripe.prices.retrieve(priceId);
  if (price.metadata?.product !== "launchixis" || price.metadata?.sku !== offering.sku) {
    throw problem("This card price is not configured for Launchixis.", 409);
  }
  const mode = offering.interval ? "subscription" : "payment";
  if (mode === "subscription" && price.type !== "recurring") throw problem("This card price is not a subscription.", 409);
  if (mode === "payment" && price.type === "recurring") throw problem("This card price is not a one-time price.", 409);
  const order = await store.claim(user.id, attemptId, deliverableFor(offering), TEMPLATE_VERSION, offering.sku);
  if (order.status === "captured") throw problem("A purchase is already recorded. Refresh access or contact support; no new charge was made.", 409);
  if (order.status === "released") throw problem("This attempt was released. Start a new purchase attempt.", 409);
  const metadata = { product: "launchixis", sku: offering.sku, order_id: order.id, user_id: user.id };
  const params = {
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pricing?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    client_reference_id: order.id,
    customer_email: user.email,
    metadata,
    integration_identifier: `launchixis_checkout_${suffix()}`,
  };
  if (mode === "subscription") params.subscription_data = { metadata };
  else params.payment_intent_data = { metadata };
  const session = await stripe.checkout.sessions.create(params, { idempotencyKey: `lx-card-${order.id}` });
  if (!session?.url?.startsWith("https://checkout.stripe.com/")) throw problem("Card checkout could not be started.", 502);
  return { url: session.url, orderId: order.id };
}

async function writeLedger(store, entry) {
  const saved = await store.ledger(entry);
  return saved?.duplicate ? { duplicate: true } : { duplicate: false };
}

async function fulfillSession(event, store) {
  const session = event.data.object;
  const meta = session.metadata || {};
  if (meta.product !== "launchixis") return { ok: true, ignored: true };
  if (session.payment_status === "unpaid") return { ok: true, pending: true };
  const offering = offeringBySku(meta.sku);
  if (!offering || !meta.order_id) throw problem("Checkout session is missing a Launchixis order.", 400);
  const order = await store.get(meta.order_id);
  if (!order || order.user_id !== meta.user_id || order.product_key !== offering.sku) throw problem("Checkout session does not match the order.", 409);
  const receiptId = String(session.payment_intent || session.subscription || session.id);
  if (order.status !== "captured") {
    await store.provision(order.id, session.id);
    await store.captured(order.id, receiptId);
    order.status = "captured";
    order.receipt_id = receiptId;
  }
  await store.markCardRefs(order.id, {
    paymentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
    subscriptionId: typeof session.subscription === "string" ? session.subscription : "",
    subscriptionStatus: offering.interval ? "active" : "",
  });
  await writeLedger(store, {
    orderId: order.id, userId: order.user_id, productKey: offering.sku, method: "card",
    receiptId, amountLabel: moneyLabel(session, offering), entryKind: "purchase", stripeEventId: event.id,
  });
  return { ok: true, orderId: order.id };
}

function invoiceMeta(invoice) {
  return invoice.parent?.subscription_details?.metadata || invoice.subscription_details?.metadata || {};
}

async function fulfillRenewal(event, store) {
  const invoice = event.data.object;
  if (invoice.billing_reason === "subscription_create") return { ok: true, ignored: true };
  const meta = invoiceMeta(invoice);
  if (meta.product !== "launchixis") return { ok: true, ignored: true };
  const offering = offeringBySku(meta.sku);
  if (!offering || !meta.order_id) return { ok: true, ignored: true };
  const order = await store.get(meta.order_id);
  if (!order || order.product_key !== offering.sku) return { ok: true, ignored: true };
  await writeLedger(store, {
    orderId: order.id, userId: order.user_id, productKey: offering.sku, method: "card",
    receiptId: invoice.id, amountLabel: moneyLabel(invoice, offering), entryKind: "renewal", stripeEventId: event.id,
  });
  return { ok: true, orderId: order.id };
}

async function cancelSubscription(event, store) {
  const sub = event.data.object;
  if (sub.metadata?.product !== "launchixis" || !sub.metadata.order_id) return { ok: true, ignored: true };
  await store.markCardRefs(sub.metadata.order_id, { subscriptionId: sub.id, subscriptionStatus: "canceled" });
  return { ok: true };
}

async function recordRefund(event, store) {
  const charge = event.data.object;
  const paymentId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";
  if (!paymentId || !charge.refunded) return { ok: true, ignored: true };
  const order = await store.findByPayment(paymentId);
  if (!order) return { ok: true, ignored: true };
  await store.markCardRefs(order.id, { refunded: true });
  await writeLedger(store, {
    orderId: order.id, userId: order.user_id, productKey: order.product_key, method: "card",
    receiptId: charge.id, amountLabel: `Refund · ${order.product_key}`, entryKind: "refund", stripeEventId: event.id,
  });
  return { ok: true, orderId: order.id };
}

export async function applyStripeEvent(event, { store }) {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") return fulfillSession(event, store);
  if (event.type === "checkout.session.async_payment_failed" || event.type === "invoice.payment_failed") return { ok: true, ignored: true };
  if (event.type === "invoice.paid") return fulfillRenewal(event, store);
  if (event.type === "customer.subscription.deleted") return cancelSubscription(event, store);
  if (event.type === "charge.refunded") return recordRefund(event, store);
  return { ok: true, ignored: true };
}
