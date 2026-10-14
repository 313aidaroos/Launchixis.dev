import { hasEntitlement } from "./apixis-wallet.ts";
import { CHECKLIST_PRODUCT } from "./product.js";
import { db } from "./db.js";
export function walletOwner(user) {
  if (!user?.email_confirmed_at) return null;
  return user.app_metadata?.apixis_sub || user.email;
}
export async function checklistAccess(user, client) {
  const owner = walletOwner(user);
  if (owner && await hasEntitlement(owner, "launchixis", CHECKLIST_PRODUCT)) return true;
  if (!user?.id) return false;
  const { data, error } = await (client || db()).from("launch_orders").select("id").eq("user_id", user.id).eq("product_key", CHECKLIST_PRODUCT).eq("status", "captured").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
