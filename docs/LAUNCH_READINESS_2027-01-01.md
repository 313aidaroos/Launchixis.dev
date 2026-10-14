# Launchixis launch readiness: official launch Jan 1, 2027

Written 2026-10-14 (CT) by Grok (Launchixis Lead) from a full read of `main` @ `dc45178`. Beta is live now; marketing starts Dec 1, 2026.

## Done (on main / live at launchixis.vercel.app)
- Colorful Cixy launch-studio theme (#26). Keep it. No redesign.
- Private customer workspaces + Launch Checklist Template sale, 1,000 Ixis via Wallet reserve/capture (#25).
- Company card art without SVG badges (#27); reused Higgsfield videos (#28).
- New accounts only through Apixis ID; magic link for existing accounts only (`shouldCreateUser:false`, #24); no password signup; `/signup` is a 404.
- Owner/admin gate, support queue at `/admin/support`, rate limit, Cixy (needs Apixis sign-in; brain fixed in #23; persona v2 has no religious content, #22).
- `/feed` (Socixis family feed, #20), `/companies` directory, `/pricing`.
- Build fix: `@/` aliases replaced with relative paths (`dc45178`, 10-13).
- `typescript` + `@types/node` are already devDependencies.

## Still to do (owner)
| Item | Owner | Status |
|---|---|---|
| Footer "Other Ixis companies" section | Grok (Launchixis Lead) | patch ready, branch `grok/footer-ixis-companies-no-svg` |
| The 9 inline `<svg>` on /companies are the StudioShell nav icons; replace with text glyphs | Grok | same branch |
| Recovra link: recovra-three.vercel.app returns 404 (10-14) | Recovra Lead / Awad | omitted from footer until fixed |
| Card-or-Ixis checkout: Stripe Checkout (one Apixis Dev LLC account, a price per tier, metadata `product=launchixis`) behind env price IDs, OFF until set; receipt + ledger entry for both paths | Grok | not started (blocked on push access; see below) |
| Remove "no Launchixis-owned Stripe Checkout" wording in `lib/steps.js` and `lib/cixy.js` once card checkout is approved | Grok | pending card decision |
| Receipts: confirm each Ixis purchase produces a customer-visible receipt (today: Wallet capture + entitlement row) | Grok | to verify |
| `supabase/schema.sql` from the live schema (project ebhzfgdavzwemrqxpvvk) | Grok | not done; needs a read-only schema dump |
| Remove `archive/landing-pack.html`, expand README | Grok | patch ready, branch `grok/cleanups-claude-list` |
| Supabase advisor: leaked-password protection WARN | Awad / Developer Bot | open |
| Draft #30 (Orbit docs) | its author | open, do not merge |

## Needs Awad only
1. Card (USD) prices for: Launch Checklist Template, Brand Kit One-off, Launch Ops Seat (monthly), Enterprise Launch Suite (monthly). Ixis prices today: 1,000 / 1,000 / 10,000 per mo / 30,000 per mo.
2. Which offerings to enable beyond the Checklist Template.
3. Custom domain (today: launchixis.vercel.app).
4. Merge approvals for every open draft PR.
