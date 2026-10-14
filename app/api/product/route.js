import { quote } from "../../../lib/apixis-wallet.ts";
import { currentUser } from "../../../lib/server-auth.js";
import { checklistAccess } from "../../../lib/product-access.js";
import { CHECKLIST_PRODUCT } from "../../../lib/product.js";
import { publicOfferings } from "../../../lib/catalog.js";
import { json, failure } from "../../../lib/http.js";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentUser();
    const offerings = publicOfferings();
    const [price, owned] = await Promise.all([quote(CHECKLIST_PRODUCT), user?.email_confirmed_at ? checklistAccess(user) : false]);
    return json({
      price: price.xp,
      owned,
      signedIn: Boolean(user?.app_metadata?.apixis_sub && user?.email_confirmed_at),
      cardAvailable: Boolean(offerings.find((item) => item.sku === CHECKLIST_PRODUCT)?.cardAvailable),
      offerings,
    });
  } catch (e) { return failure(e); }
}
