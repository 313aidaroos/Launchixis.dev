import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { applyStripeEvent, startCardCheckout, stripeClient } from "../lib/card-checkout.js";
import { cardReady, offeringBySku, publicOfferings } from "../lib/catalog.js";
import { CIXY_SYSTEM_PROMPT } from "../lib/cixy.js";
import { CHECKLIST_PRODUCT } from "../lib/product.js";
import { LAUNCH_STEPS } from "../lib/steps.js";

const user = { id: "customer", email: "buyer@example.test", email_confirmed_at: "yes", app_metadata: { apixis_sub: "wallet-owner" } };
const attempt = "11111111-1111-4111-8111-111111111111";
const env = {
  STRIPE_RESTRICTED_KEY: "rk_test_fixture",
  STRIPE_PRICE_LAUNCHIXIS_CHECKLIST: "price_checklist",
  STRIPE_PRICE_LAUNCHIXIS_OPS_SEAT: "price_ops",
};

function memoryStore(sku = CHECKLIST_PRODUCT) {
  const order = { id: "order-1", user_id: "customer", status: "pending", product_key: sku, stripe_payment_id: "" };
  const events = [];
  const store = {
    claim: async (userId, _attempt, content, _version, productKey) => {
      assert.ok(content.length > 100);
      order.user_id = userId;
      order.product_key = productKey;
      events.push("claim");
      return order;
    },
    provision: async (_id, ref) => { events.push(`provision:${ref}`); },
    captured: async (_id, receipt) => { events.push(`captured:${receipt}`); order.status = "captured"; order.receipt_id = receipt; },
    ledger: async (entry) => { events.push(`ledger:${entry.method}:${entry.entryKind}`); return { id: "ledger-1" }; },
    markCardRefs: async (_id, refs) => { events.push("refs"); if (refs.paymentId) order.stripe_payment_id = refs.paymentId; if (refs.refunded) order.status = "refunded"; if (refs.subscriptionStatus) order.subscription_status = refs.subscriptionStatus; },
    get: async () => order,
    findByPayment: async (paymentId) => (order.stripe_payment_id === paymentId ? order : null),
  };
  return { store, order, events };
}

function fakeStripe(sku, type = "one_time") {
  const calls = [];
  return {
    calls,
    prices: { retrieve: async (id) => ({ id, type, metadata: { product: "launchixis", sku } }) },
    checkout: { sessions: { create: async (params) => { calls.push(params); return { id: "cs_test_123", url: "https://checkout.stripe.com/c/pay/cs_test_123" }; } } },
  };
}

test("card checkout stays off when the price env is missing", async () => {
  const { store, events } = memoryStore();
  let called = false;
  const stripe = { prices: { retrieve: async () => { called = true; return {}; } }, checkout: { sessions: { create: async () => { called = true; } } } };
  await assert.rejects(() => startCardCheckout({ user, attemptId: attempt, productKey: CHECKLIST_PRODUCT, origin: "https://launchixis.vercel.app" }, { store, stripe, env: {} }));
  assert.equal(called, false);
  assert.deepEqual(events, []);
  assert.equal(cardReady(offeringBySku(CHECKLIST_PRODUCT), {}), false);
  assert.ok(publicOfferings({}).every((item) => item.cardAvailable === false));
});

test("one-time card checkout uses payment mode and Launchixis metadata", async () => {
  const { store } = memoryStore();
  const stripe = fakeStripe(CHECKLIST_PRODUCT);
  const result = await startCardCheckout({ user, attemptId: attempt, productKey: CHECKLIST_PRODUCT, origin: "https://launchixis.vercel.app" }, { store, stripe, env });
  assert.equal(result.url, "https://checkout.stripe.com/c/pay/cs_test_123");
  const params = stripe.calls[0];
  assert.equal(params.mode, "payment");
  assert.equal(params.metadata.product, "launchixis");
  assert.equal(params.metadata.sku, CHECKLIST_PRODUCT);
  assert.equal(params.payment_intent_data.metadata.sku, CHECKLIST_PRODUCT);
  assert.equal(params.customer_email, user.email);
  assert.equal(params.payment_method_types, undefined);
  assert.match(params.integration_identifier, /^launchixis_checkout_[a-z]{8}$/);
  assert.equal(params.line_items[0].price, "price_checklist");
});

test("monthly tiers use Stripe subscription mode", async () => {
  const { store } = memoryStore("launchixis.ops.seat");
  const stripe = fakeStripe("launchixis.ops.seat", "recurring");
  await startCardCheckout({ user, attemptId: attempt, productKey: "launchixis.ops.seat", origin: "https://launchixis.vercel.app" }, { store, stripe, env });
  assert.equal(stripe.calls[0].mode, "subscription");
  assert.equal(stripe.calls[0].subscription_data.metadata.product, "launchixis");
  assert.equal(stripe.calls[0].subscription_data.metadata.sku, "launchixis.ops.seat");
  assert.equal(stripe.calls[0].payment_method_types, undefined);
});

test("a price without Launchixis metadata never opens Checkout", async () => {
  const { store, events } = memoryStore();
  const stripe = { prices: { retrieve: async () => ({ id: "price_checklist", type: "one_time", metadata: {} }) }, checkout: { sessions: { create: async () => { throw new Error("should not create"); } } } };
  await assert.rejects(() => startCardCheckout({ user, attemptId: attempt, productKey: CHECKLIST_PRODUCT, origin: "https://launchixis.vercel.app" }, { store, stripe, env }), /not configured/);
  assert.deepEqual(events, []);
});

test("webhook signature is required and a paid session fulfills the same order path", async () => {
  const secret = "whsec_test_fixture";
  const { store, events, order } = memoryStore();
  const payload = JSON.stringify({
    id: "evt_paid",
    object: "event",
    type: "checkout.session.completed",
    data: { object: {
      id: "cs_test_123", object: "checkout.session", payment_status: "paid",
      payment_intent: "pi_test_123", amount_total: 1000, currency: "usd",
      metadata: { product: "launchixis", sku: CHECKLIST_PRODUCT, order_id: order.id, user_id: order.user_id },
    } },
  });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  const event = stripeClient("rk_test_fixture").webhooks.constructEvent(payload, header, secret);
  assert.equal((await applyStripeEvent(event, { store })).ok, true);
  assert.deepEqual(events, ["provision:cs_test_123", "captured:pi_test_123", "refs", "ledger:card:purchase"]);
  await assert.rejects(async () => stripeClient("rk_test_fixture").webhooks.constructEvent(payload, "t=1,v1=deadbeef", secret));
});

test("unpaid and failed card events do not fulfill", async () => {
  const { store, events } = memoryStore();
  const unpaid = { id: "evt_unpaid", type: "checkout.session.completed", data: { object: { payment_status: "unpaid", metadata: { product: "launchixis", sku: CHECKLIST_PRODUCT, order_id: "order-1", user_id: "customer" } } } };
  assert.equal((await applyStripeEvent(unpaid, { store })).pending, true);
  const failed = { id: "evt_fail", type: "checkout.session.async_payment_failed", data: { object: {} } };
  assert.equal((await applyStripeEvent(failed, { store })).ignored, true);
  assert.deepEqual(events, []);
});

test("async payment success fulfills and a repeated event does not open a second order", async () => {
  const { store, events, order } = memoryStore();
  let ledgers = 0;
  store.ledger = async (entry) => { ledgers += 1; events.push(`ledger:${entry.entryKind}`); return ledgers === 1 ? { id: "ledger-1" } : { duplicate: true }; };
  const event = { id: "evt_async", type: "checkout.session.async_payment_succeeded", data: { object: {
    id: "cs_async", payment_status: "paid", payment_intent: "pi_async", currency: "usd", amount_total: 1000,
    metadata: { product: "launchixis", sku: CHECKLIST_PRODUCT, order_id: order.id, user_id: order.user_id },
  } } };
  await applyStripeEvent(event, { store });
  await applyStripeEvent(event, { store });
  assert.equal(events.filter((item) => item.startsWith("provision")).length, 1);
  assert.equal(events.filter((item) => item.startsWith("captured")).length, 1);
  assert.equal(ledgers, 2);
});

test("subscription renewal records a ledger row and the first invoice does not double-fulfill", async () => {
  const { store, events, order } = memoryStore("launchixis.ops.seat");
  order.product_key = "launchixis.ops.seat";
  const created = { id: "evt_create", type: "invoice.paid", data: { object: { id: "in_create", billing_reason: "subscription_create", parent: { subscription_details: { metadata: { product: "launchixis", sku: "launchixis.ops.seat", order_id: order.id } } } } } };
  assert.equal((await applyStripeEvent(created, { store })).ignored, true);
  const renewal = { id: "evt_cycle", type: "invoice.paid", data: { object: { id: "in_cycle", billing_reason: "subscription_cycle", amount_paid: 10000, currency: "usd", parent: { subscription_details: { metadata: { product: "launchixis", sku: "launchixis.ops.seat", order_id: order.id } } } } } };
  assert.equal((await applyStripeEvent(renewal, { store })).ok, true);
  assert.deepEqual(events, ["ledger:card:renewal"]);
  const ended = { id: "evt_end", type: "customer.subscription.deleted", data: { object: { id: "sub_123", metadata: { product: "launchixis", order_id: order.id } } } };
  await applyStripeEvent(ended, { store });
  assert.equal(order.subscription_status, "canceled");
});

test("a full card refund keeps a ledger row and removes captured access", async () => {
  const { store, events, order } = memoryStore();
  order.status = "captured";
  order.stripe_payment_id = "pi_test_123";
  const event = { id: "evt_refund", type: "charge.refunded", data: { object: { id: "ch_123", refunded: true, payment_intent: "pi_test_123" } } };
  await applyStripeEvent(event, { store });
  assert.equal(order.status, "refunded");
  assert.ok(events.includes("ledger:card:refund"));
});

test("copy no longer says Launchixis has no card checkout", () => {
  const hint = LAUNCH_STEPS.find((step) => step.id === "ixis_pricing").hint;
  assert.match(hint, /card/i);
  assert.match(hint, /Apixis Wallet/);
  assert.doesNotMatch(hint, /No Launchixis-owned Stripe Checkout/);
  assert.match(CIXY_SYSTEM_PROMPT, /Customers choose card or Ixis/);
  assert.doesNotMatch(CIXY_SYSTEM_PROMPT, /No Launchixis-owned Stripe Checkout/);
});
