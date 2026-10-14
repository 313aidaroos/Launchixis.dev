export const OFFERINGS = [
  { sku: "launchixis.template.checklist", name: "Launch Checklist Template", ixis: 1000, interval: null, ixisEnabled: true, priceEnv: "STRIPE_PRICE_LAUNCHIXIS_CHECKLIST" },
  { sku: "launchixis.brandkit.oneoff", name: "Brand Kit One-off", ixis: 1000, interval: null, ixisEnabled: false, priceEnv: "STRIPE_PRICE_LAUNCHIXIS_BRAND_KIT" },
  { sku: "launchixis.ops.seat", name: "Launch Ops Seat", ixis: 10000, interval: "month", ixisEnabled: false, priceEnv: "STRIPE_PRICE_LAUNCHIXIS_OPS_SEAT" },
  { sku: "launchixis.enterprise.suite", name: "Enterprise Launch Suite", ixis: 30000, interval: "month", ixisEnabled: false, priceEnv: "STRIPE_PRICE_LAUNCHIXIS_ENTERPRISE" },
];

export function offeringBySku(sku) {
  return OFFERINGS.find((item) => item.sku === sku) || null;
}

// Prefer a restricted key (rk_). STRIPE_SECRET_KEY remains the fallback name.
export function stripeSecret(env = process.env) {
  return String(env.STRIPE_RESTRICTED_KEY || env.STRIPE_SECRET_KEY || "").trim();
}

export function priceIdFor(offering, env = process.env) {
  return String(env[offering.priceEnv] || "").trim();
}

export function cardReady(offering, env = process.env) {
  return Boolean(offering && priceIdFor(offering, env) && stripeSecret(env));
}

export function publicOfferings(env = process.env) {
  return OFFERINGS.map((item) => ({
    sku: item.sku,
    name: item.name,
    ixis: item.ixis,
    interval: item.interval,
    ixisEnabled: item.ixisEnabled,
    cardAvailable: cardReady(item, env),
  }));
}
