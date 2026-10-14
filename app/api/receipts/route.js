import { currentUser } from "../../../lib/server-auth.js";
import { db } from "../../../lib/db.js";
import { purchaseStore } from "../../../lib/purchase-store.js";
import { offeringBySku } from "../../../lib/catalog.js";
import { json, failure } from "../../../lib/http.js";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.email_confirmed_at || !user?.app_metadata?.apixis_sub) return json({ error: "Sign in with Apixis to see receipts." }, 401);
    const rows = await purchaseStore(db()).receiptsFor(user.id);
    return json({ receipts: (rows || []).map((row) => ({
      id: row.id,
      sku: row.product_key,
      name: offeringBySku(row.product_key)?.name || row.product_key,
      method: row.method,
      receiptId: row.receipt_id,
      amountLabel: row.amount_label,
      entryKind: row.entry_kind,
      createdAt: row.created_at,
    })) });
  } catch (e) { return failure(e); }
}
