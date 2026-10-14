import { randomUUID } from "node:crypto";
import { CHECKLIST_PRODUCT } from "./product.js";
export function purchaseStore(client) {
  async function check(result) { if (result.error) throw result.error; return result.data; }
  return {
    async claim(userId, attemptId, content, templateVersion, productKey = CHECKLIST_PRODUCT) {
      const existing = await check(await client.from("launch_orders").select("*").eq("user_id", userId).eq("attempt_id", attemptId).maybeSingle());
      if (existing) return existing;
      const result = await client.from("launch_orders").insert({ id: randomUUID(), user_id: userId, attempt_id: attemptId, product_key: productKey, content, template_version: templateVersion }).select("*").single();
      if (result.error?.code !== "23505") return check(result);
      const active = await check(await client.from("launch_orders").select("*").eq("user_id", userId).eq("product_key", productKey).in("status", ["pending", "captured"]).maybeSingle());
      if (!active) throw result.error;
      return active;
    },
    async provision(id, reservationId) {
      const rows = await check(await client.from("launch_orders").update({ reservation_id: reservationId }).eq("id", id).eq("status", "pending").select("id"));
      if (!rows?.length) {
        const order = await this.get(id);
        if (order?.status !== "captured") throw new Error("Order is no longer available.");
      }
    },
    async released(id) { await check(await client.from("launch_orders").update({ status: "released" }).eq("id", id).eq("status", "pending")); },
    async captured(id, receiptId) { await check(await client.from("launch_orders").update({ status: "captured", receipt_id: receiptId }).eq("id", id)); },
    async get(id) { return check(await client.from("launch_orders").select("*").eq("id", id).single()); },
    async findByPayment(paymentId) { return check(await client.from("launch_orders").select("*").eq("stripe_payment_id", paymentId).maybeSingle()); },
    async markCardRefs(id, refs) {
      const patch = {};
      if (refs.paymentId) patch.stripe_payment_id = refs.paymentId;
      if (refs.subscriptionId) patch.stripe_subscription_id = refs.subscriptionId;
      if (refs.subscriptionStatus) patch.subscription_status = refs.subscriptionStatus;
      if (refs.refunded) patch.status = "refunded";
      if (!Object.keys(patch).length) return;
      await check(await client.from("launch_orders").update(patch).eq("id", id));
    },
    async ledger(entry) {
      const row = {
        id: randomUUID(), order_id: entry.orderId, user_id: entry.userId, product_key: entry.productKey,
        method: entry.method, receipt_id: entry.receiptId, amount_label: entry.amountLabel,
        entry_kind: entry.entryKind || "purchase", stripe_event_id: entry.stripeEventId || null,
      };
      const result = await client.from("purchase_ledger").insert(row).select("*").single();
      if (result.error?.code === "23505") return { duplicate: true };
      return check(result);
    },
    async receiptsFor(userId) {
      return check(await client.from("purchase_ledger").select("id,product_key,method,receipt_id,amount_label,entry_kind,created_at").eq("user_id", userId).order("created_at", { ascending: false })) || [];
    },
    async backfillLedger(userId, productKey, amountLabel) {
      const order = await check(await client.from("launch_orders").select("*").eq("user_id", userId).eq("product_key", productKey).eq("status", "captured").maybeSingle());
      if (!order?.receipt_id) return;
      await this.ledger({ orderId: order.id, userId, productKey, method: "ixis", receiptId: order.receipt_id, amountLabel, entryKind: "purchase", stripeEventId: null });
    },
  };
}
