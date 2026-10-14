import { applyStripeEvent, stripeClient, stripeSecret } from "../../../../lib/card-checkout.js";
import { purchaseStore } from "../../../../lib/purchase-store.js";
import { db } from "../../../../lib/db.js";
import { json, failure } from "../../../../lib/http.js";
export const dynamic = "force-dynamic";
export async function POST(request) {
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  const key = stripeSecret();
  if (!secret || !key) return json({ error: "Card webhook is not configured." }, 503);
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");
  let event;
  try {
    event = stripeClient(key).webhooks.constructEvent(raw, signature, secret);
  } catch {
    return json({ error: "Invalid Stripe signature." }, 400);
  }
  try {
    return json(await applyStripeEvent(event, { store: purchaseStore(db()) }));
  } catch (e) { return failure(e); }
}
