import { CHECKLIST_PRODUCT, launchGuide, TEMPLATE_VERSION } from "./product.js";
import { problem } from "./http.js";

// Dependencies are injected so retry/fulfillment behavior is tested without spending real Ixis.
export async function purchaseChecklist({ user, attemptId, productKey }, { store, wallet }) {
  if (!user?.email_confirmed_at || !user?.app_metadata?.apixis_sub) throw problem("Sign in with Apixis before purchasing.", 401);
  if (productKey !== CHECKLIST_PRODUCT) throw problem("This product is not on sale.", 409);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId || "")) throw problem("A valid purchase attempt is required.");
  const owner = user.app_metadata.apixis_sub;
  if (await wallet.hasEntitlement(owner, "launchixis", CHECKLIST_PRODUCT)) {
    if (typeof store.backfillLedger === "function") await store.backfillLedger(user.id, CHECKLIST_PRODUCT, "1,000 Ixis");
    return { ok: true, alreadyOwned: true };
  }
  const order = await store.claim(user.id, attemptId, launchGuide(), TEMPLATE_VERSION);
  if (order.status === "captured") throw problem("A purchase is already recorded. Refresh access or contact support; no new charge was made.", 409);
  if (order.status === "released") throw problem("This attempt was released. Start a new purchase attempt.", 409);
  try {
    const result = await wallet.redeem({
      owner, productKey: CHECKLIST_PRODUCT, idempotencyKey: `lx-checklist-${order.id}`,
      provision: async reservation => {
        // Durable deliverable exists before capture. Wallet entitlement authorizes downloads/edits.
        await store.provision(order.id, reservation.reservationId);
        return { orderId: order.id };
      },
      unprovision: async () => store.released(order.id),
    });
    if (!result.ok) { await store.released(order.id); return result; }
    await store.captured(order.id, result.receiptId);
    await store.ledger({ orderId: order.id, userId: user.id, productKey: CHECKLIST_PRODUCT, method: "ixis", receiptId: result.receiptId, amountLabel: "1,000 Ixis", entryKind: "purchase", stripeEventId: null });
    return { ok: true, receiptId: result.receiptId };
  } catch (error) {
    // Unknown outcomes remain pending and reuse the same Wallet key on the next request.
    // Never remove a deliverable or clear an attempt just because a network response was lost.
    const current = await store.get(order.id);
    if (current?.reservation_id && current.status === "pending") {
      const state = await wallet.reservationStatus(current.reservation_id).catch(() => null);
      if (state?.status === "captured") {
        await store.captured(order.id, state.receiptId || "");
        await store.ledger({ orderId: order.id, userId: user.id, productKey: CHECKLIST_PRODUCT, method: "ixis", receiptId: state.receiptId || order.id, amountLabel: "1,000 Ixis", entryKind: "purchase", stripeEventId: null });
        return { ok: true, receiptId: state.receiptId };
      }
      if (state?.status === "released") await store.released(order.id);
    }
    throw error;
  }
}
