// Purchase smoke test.
//
// Test mode (default): starts the local fixture preview (fake Wallet, in-memory
// tables, no Stripe price env) and checks three things against that URL:
//   1. Ixis checkout goes through the fake Wallet
//   2. Card checkout stays disabled while price env vars are unset
//   3. The purchase leaves a customer receipt and a purchase_ledger row
//
// Optional: node scripts/smoke-purchase.mjs https://<preview>
// also checks that preview's GET /api/product reports card checkout off.
// It does not sign in, call the real Wallet, or read that preview's database.
//
// Requires a production build first (`npm run build` or `npm run check`).
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { fixtureServer, sessionCookie, users } from "../tests/integration/fixture.mjs";

const remotePreview = process.argv[2] && process.argv[2] !== "test" ? process.argv[2].replace(/\/$/, "") : "";

function fail(message) {
  console.error(`smoke-purchase: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

async function readJson(response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function checkCardDisabled(base, { signedIn = false } = {}) {
  const productRes = await fetch(`${base}/api/product`);
  const product = await readJson(productRes);
  if (!productRes.ok) fail(`GET /api/product returned ${productRes.status}`);
  if (product.cardAvailable !== false) fail("checklist card checkout is available; price env should be unset");
  for (const item of product.offerings || []) {
    if (item.cardAvailable !== false) fail(`${item.sku} card checkout is available`);
  }
  const headers = { "content-type": "application/json", origin: base };
  if (signedIn) headers.cookie = sessionCookie(users.alice);
  const checkoutRes = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ productKey: "launchixis.template.checklist", attemptId: randomUUID() }),
  });
  const checkout = await readJson(checkoutRes);
  if (String(checkout.url || "").startsWith("https://checkout.stripe.com/")) fail("card checkout returned a Stripe URL");
  const expected = signedIn ? 409 : 401;
  if (checkoutRes.status !== expected) fail(`card checkout returned ${checkoutRes.status}, expected ${expected}`);
  console.log(`card checkout disabled at ${base}`);
}

async function checkIxisReceiptLedger(base, fixture) {
  const attemptId = randomUUID();
  const buyRes = await fetch(`${base}/api/redeem`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base, cookie: sessionCookie(users.alice) },
    body: JSON.stringify({ productKey: "launchixis.template.checklist", attemptId }),
  });
  const buy = await readJson(buyRes);
  if (!buyRes.ok) fail(`Ixis checkout failed (${buyRes.status})`);
  if (fixture.state.charges !== 1) fail("fake Wallet was not charged once");
  const receiptRes = await fetch(`${base}/api/receipts`, { headers: { cookie: sessionCookie(users.alice) } });
  const receiptBody = await readJson(receiptRes);
  if (!receiptRes.ok) fail(`GET /api/receipts returned ${receiptRes.status}`);
  const receipt = (receiptBody.receipts || []).find((row) => row.method === "ixis" && row.receiptId);
  if (!receipt) fail("no Ixis receipt was returned");
  const ledger = fixture.state.tables.purchase_ledger.filter((row) => row.method === "ixis" && row.entry_kind === "purchase" && row.receipt_id === receipt.receiptId);
  if (ledger.length !== 1) fail("purchase_ledger did not keep one matching Ixis row");
  console.log("Ixis checkout wrote a receipt and a ledger row");
}

function childEnv(fixtureUrl, base) {
  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
    SUPABASE_URL: fixtureUrl,
    SUPABASE_ANON_KEY: "fixture-anon",
    SUPABASE_SERVICE_ROLE_KEY: "fixture-service",
    APIXIS_WALLET_API_URL: fixtureUrl,
    WALLET_API_KEY: "fixture-wallet-key-long-enough",
    APP_URL: base,
  };
  for (const key of Object.keys(env)) {
    if (key.startsWith("STRIPE_")) delete env[key];
  }
  return env;
}

async function waitFor(base) {
  let last = "";
  for (let i = 0; i < 100; i++) {
    try { await fetch(base); return; } catch (error) { last = error.message; }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  fail(`preview did not start (${last})`);
}

async function runTestMode() {
  const fixture = await fixtureServer();
  const port = 3217;
  const base = `http://127.0.0.1:${port}`;
  fixture.state.previewUrl = base;
  const proc = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: childEnv(fixture.url, base),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  proc.stdout.on("data", (chunk) => { logs += chunk; });
  proc.stderr.on("data", (chunk) => { logs += chunk; });
  try {
    await waitFor(base);
    await checkCardDisabled(base, { signedIn: true });
    await checkIxisReceiptLedger(base, fixture);
    console.log(`test mode passed at ${base}`);
  } catch (error) {
    if (!logs.includes("Ready")) console.error(logs.slice(-2000));
    throw error;
  } finally {
    proc.kill("SIGTERM");
    await once(proc, "exit");
    await new Promise((resolve) => fixture.server.close(resolve));
  }
}

if (remotePreview) await checkCardDisabled(remotePreview);
await runTestMode();
