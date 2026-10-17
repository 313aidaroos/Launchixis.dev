import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  launchixisReturnUrl,
  walletBuyUrl,
  walletHomeUrl,
} from "../lib/wallet.js";

const PRICING_BUY =
  "https://apixis-wallet.vercel.app?tab=buy&origin=launchixis&return_url=https%3A%2F%2Flaunchixis.apixis.dev%2Fpricing";
const HOME_BUY =
  "https://apixis-wallet.vercel.app?tab=buy&origin=launchixis&return_url=https%3A%2F%2Flaunchixis.apixis.dev%2F";

test("buy deep link defaults to the pricing return", () => {
  assert.equal(walletBuyUrl(), PRICING_BUY);
  assert.equal(walletBuyUrl("/pricing"), PRICING_BUY);
});

test("board can return to the site root", () => {
  assert.equal(walletBuyUrl("/"), HOME_BUY);
  assert.equal(launchixisReturnUrl("/"), "https://launchixis.apixis.dev/");
});

test("unknown return paths stay on the allowlist", () => {
  assert.equal(walletBuyUrl("https://evil.example"), PRICING_BUY);
  assert.equal(walletBuyUrl("/login"), PRICING_BUY);
});

test("open wallet keeps origin and return without forcing the buy tab", () => {
  const url = new URL(walletHomeUrl("/pricing"));
  assert.equal(url.origin, "https://apixis-wallet.vercel.app");
  assert.equal(url.searchParams.get("origin"), "launchixis");
  assert.equal(url.searchParams.get("tab"), null);
  assert.equal(
    url.searchParams.get("return_url"),
    "https://launchixis.apixis.dev/pricing"
  );
});

test("pricing and shared navigation use the approved Wallet host", () => {
  const pricing = readFileSync(
    new URL("../app/pricing/page.jsx", import.meta.url),
    "utf8"
  );
  const navigation = readFileSync(
    new URL("../components/StudioShell.jsx", import.meta.url),
    "utf8"
  );
  const cixy = readFileSync(new URL("../lib/cixy.js", import.meta.url), "utf8");
  assert.equal(pricing.includes("wallet.apixis.dev"), false);
  assert.equal(pricing.includes("Wallet connecting"), false);
  assert.equal(cixy.includes("wallet.apixis.dev"), false);
  assert.match(pricing, /walletBuyUrl\("\/pricing"\)/);
  assert.match(navigation, /walletBuyUrl\("\/"\)/);
});
