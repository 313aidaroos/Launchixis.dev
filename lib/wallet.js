// Deep link into Apixis Wallet. Sister sites already use ?tab=redeem&product=
// on this host; buy uses the same query shape. Cash credit stays on Wallet.

export const WALLET_HOST = "https://apixis-wallet.vercel.app";
export const LAUNCHIXIS_HOST = "https://launchixis.apixis.dev";
export const WALLET_ORIGIN_SLUG = "launchixis";

const RETURN_URLS = {
  "/": `${LAUNCHIXIS_HOST}/`,
  "/pricing": `${LAUNCHIXIS_HOST}/pricing`,
};

export function launchixisReturnUrl(returnPath = "/pricing") {
  return RETURN_URLS[returnPath] || RETURN_URLS["/pricing"];
}

export function walletBuyUrl(returnPath = "/pricing") {
  const params = new URLSearchParams({
    tab: "buy",
    origin: WALLET_ORIGIN_SLUG,
    return_url: launchixisReturnUrl(returnPath),
  });
  return `${WALLET_HOST}?${params.toString()}`;
}

export function walletHomeUrl(returnPath = "/pricing") {
  const params = new URLSearchParams({
    origin: WALLET_ORIGIN_SLUG,
    return_url: launchixisReturnUrl(returnPath),
  });
  return `${WALLET_HOST}?${params.toString()}`;
}
