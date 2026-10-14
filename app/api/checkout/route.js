import { currentUser } from "../../../lib/server-auth.js";
import { db } from "../../../lib/db.js";
import { purchaseStore } from "../../../lib/purchase-store.js";
import { startCardCheckout, stripeClient, stripeSecret } from "../../../lib/card-checkout.js";
import { json, failure, readJson, sameOrigin } from "../../../lib/http.js";
import { limitByIp } from "../../../lib/rate-limit.js";
export const dynamic = "force-dynamic";
export async function POST(request) {
  try {
    sameOrigin(request);
    const user = await currentUser();
    if (!user?.email_confirmed_at || !user?.app_metadata?.apixis_sub) return json({ error: "Sign in with Apixis to purchase." }, 401);
    const limited = await limitByIp(request, "checkout", 10); if (limited) return limited;
    const secret = stripeSecret();
    const stripe = stripeClient(secret);
    if (!stripe) return json({ error: "Card checkout is not available for this product." }, 409);
    const body = await readJson(request);
    const origin = process.env.APP_URL || new URL(request.url).origin;
    const result = await startCardCheckout({ user, attemptId: body.attemptId, productKey: body.productKey, origin }, { store: purchaseStore(db()), stripe });
    return json(result);
  } catch (e) { return failure(e); }
}
