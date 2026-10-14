# Launchixis

Private launch operations for the Apixis family, plus a customer Launch Checklist workspace.

## Customer journey

Sign in with Apixis ID → create one private company workspace → purchase the existing `launchixis.template.checklist` SKU through the shared Wallet → download the 13-step launch guide and edit the checklist, status, and notes. The price is fetched from the canonical Wallet catalog (currently 1,000 Ixis). Brand kits, operator seats, and enterprise services remain unavailable.

The checklist is a planning tool; it does not deploy a site or provide a human operator. Cixy gives advice using the selected launch and the last eight messages. Cixy requires admin access or a checklist entitlement.

## Access model

- Signed-out visitors see the product introduction, public company directory, feed, pricing, and support form.
- Verified customers can create one workspace and read only their own records. A Wallet entitlement is required to edit or download the guide.
- Verified owner/admin emails can manage all launches and the support queue at `/admin/support`.
- Existing family rows have `owner_id = NULL` and remain admin-only. Customer rows carry the verified local user ID. Never make a customer an admin to grant access to their own workspace.
- Database tables are server-only with RLS enabled and no anon/authenticated table privileges. Every server route also checks identity and ownership.
- Support requests persist in the admin queue, which refreshes every 30 seconds. The board shows a new-ticket count on load. Reply from your support mailbox using the queue link. This app does not claim or perform automatic email delivery.

## Local setup

Use Node 22.18+ (CI uses Node 22). Copy `.env.example` to `.env.local` and set this company's credentials. Never reuse another site's service key.

```sh
npm ci
npm run dev
```

Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WALLET_API_KEY`, `APIXIS_CLIENT_ID`, and `APP_URL`. Cixy also needs `ANTHROPIC_API_KEY`. The family feed needs `APIXIS_WORLD_KEY`.

The registered Apixis callback must match your site. The shared SDK is copied from ApixisWallet; change it upstream rather than forking local payment logic. See `docs/APIXIS_FAMILY.md`.

## Database rollout

For a fresh database, apply `scripts/schema.sql`, then every file in `supabase/migrations/` in filename order. For an existing deployment, apply the new additive migration before deploying this code. It preserves the original company and ticket rows, adds private ownership/version fields, stores purchase deliverables, and creates a shared atomic rate limiter.

`npm run seed` is an explicit administrator operation to seed family companies; it needs server environment variables in the process (for example `node --env-file=.env.local scripts/seed.mjs`). Normal page/API reads never seed or backfill records.

## Purchase guarantees

Customers pay by card or with Ixis. Ixis still redeems from the shared Apixis Wallet, which remains the source of truth for the Ixis balance. Launchixis stores no local Ixis balance. Card checkout uses one Stripe account (Apixis Dev LLC) and stays off until `STRIPE_PRICE_LAUNCHIXIS_CHECKLIST` (and the other `STRIPE_PRICE_LAUNCHIXIS_*` names) plus a Stripe key and webhook secret are set. The deliverable is persisted before capture. A partial unique index gives each customer only one pending/captured checklist order. Concurrent requests reuse it and the same Wallet idempotency key. A lost response is reconciled against reservation status; an unknown outcome remains pending and is retried safely. Only a confirmed release permits a new order. Downloads remain available through the Wallet entitlement even if the final local receipt update needs a retry.

## Checks

```sh
npm run check
npm audit --audit-level=high
```

`check` runs ESLint, TypeScript, unit tests (including redirect tests), SQL tests in an isolated PGlite database, the production build, and HTTP integration tests against the real built app with local fake Supabase/Wallet services. The tests cover customer isolation, permission denial, persisted edits, stale saves, purchase recovery without double charges, downloads, support queue access, and redirect failure handling. Tests never use a live wallet or create production users.

For a manual browser review with fake local accounts after building: `node tests/integration/preview.mjs`. Follow the printed localhost links. The fixture sign-in route exists only in the test server and is never deployed as an application route.

## Operations and recovery

- Use the admin queue for support and customer purchase references.
- If Wallet access cannot be verified, editing/downloads fail closed. Retrying a pending purchase uses the same order; do not delete pending rows to fix a timeout.
- Field saves carry a version number. A 409 means another session changed the record; review/reload and reapply your edits.
- Rate limiting is stored in Supabase and shared across server instances. If it is unavailable, protected costly/public write routes return 503.
- Roll back application code using the previous Vercel deployment if necessary. The database migration is additive and can remain in place. Rolling back to the old app re-exposes the old public board, so prefer a forward fix for privacy issues.
