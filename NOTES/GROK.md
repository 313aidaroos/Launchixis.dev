Grok Bot (Developer Bot hub + product leads) notes. Every change Grok Bot makes to this product (code, env, database, deploys) gets a dated entry here so Claude, Hermes and Codex stay on the same page.

## 2026-10-04 summary

- **Grok:** added the two-owner verified admin allowlist.
- **Claude:** merged PR #21 (`cbb79eb`) around 6:30 PM CT, adding the full-portfolio review to `NOTES/CLAUDE.md` and `AI_CHANGELOG.md` (notes/docs only).
- **Hermes:** no 2026-10-04 commit or merged PR identified in this repository.
- **Juno:** no 2026-10-04 commit or merged PR identified in this repository.

## Catch-up correction — 2026-10-04 (CT)

Claude activity was present; the earlier “no Claude activity” line was incorrect. Each item below has an undo pointer.

- **Claude, 2026-10-04 6:31 PM CT — PR #21, merge `cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`:** notes: Claude full-portfolio review 2026-10-04 (NOTES/CLAUDE.md, AI_CHANGELOG); added `NOTES/CLAUDE.md` and `AI_CHANGELOG.md` (notes/docs only). Undo: `git revert cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`.
- **2026-10-04 6:31 PM CT — 313aidaroos:** `notes: Claude full-portfolio review 2026-10-04 (NOTES/CLAUDE.md, AI_CHANGELOG) (#21)` landed as `cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`. Where: commit `cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`. Undo: `git revert cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`.

## 2026-09-27 (CT) — Developer Bot (hub)
- Wallet registration: added `launchixis` to `wallet_api_clients` in Supabase project `kzneeksminozmhnqaaun`, with `require_sso=false`.
- Callback URLs registered: https://launchixis.vercel.app/auth/apixis/callback.
- Vercel env: replaced `WALLET_API_KEY` with a per-product `apx_live_` key, added `APIXIS_CLIENT_ID=launchixis`, and left legacy `APIXIS_WALLET_API_KEY` present (name-only check); production was redeployed from the same product commit.
- Cleanup status: the attempted deletion of legacy `APIXIS_WALLET_API_KEY` variables was stopped at about 22:45 CT; no deletion was made here.
- Undo: restore `WALLET_API_KEY` to its legacy value and deactivate the `launchixis` client row.

## 2026-09-27 — Apixis ID + Wallet balance pill (Grok Bot)
- **What:** Merged Claude's PR #3 (Sign in with Apixis + shared Wallet) with Grok commit 06261df: `ApixisWalletChip` (shared single fetch of `/api/wallet/balance`, refetch on focus / visibilitychange / pageshow, "Sign in with Apixis" when unlinked), balance route returns `linked`. Merge SHA 1abebef.
- **Follow-up PR #9** (merge 0af6d60): Launchixis sets `SUPABASE_URL` / `SUPABASE_ANON_KEY`, not the `NEXT_PUBLIC_*` names the SDK files read, so the balance route returned `{available:null}` for everyone and the Apixis callback would fail. `app/api/wallet/balance/route.js` and `lib/apixis-login.ts` now fall back to the site's names.
- **Verified:** prod READY; `/api/wallet/balance` → 401 `{signIn:true}` without a session.
- **Undo:** revert PR #9 (`git revert -m 1 0af6d60`), then PR #3 (`git revert -m 1 1abebef`).
- No Wallet code, env/keys, Stripe, checkout or payment links changed.

## 2026-10-02 (CT) — Backfill by Launchixis Lead (Grok): changes since the 2026-09-27 entries
Logged from git history and PR records, read-only. All times CT. Everything below was merged through a PR into `main`. After `cefbb03` (the last notes commit) nothing went straight to `main` until this entry.

- **2026-09-28 04:08, Juno, PR #10** (`junoai/ai-changelog`, merge `27d08f2`): added `AI_CHANGELOG.md` and the AI change-log rule in `CLAUDE.md`. Undo: `git revert 27d08f2`.
- **2026-09-28 04:46, Juno, PR #11** (`junoai/ci`, merge `c7bd234`): added `.github/workflows/ci.yml`, which calls the shared `313aidaroos/github-actions` node-ci workflow, plus `JUNOAI_NOTES.md`. Undo: `git revert c7bd234`.
- **2026-09-30 01:22, Codex, PR #12** (`codex/tester-readiness`, merge `8d09c4a`): hardened shared-login return destinations with new `lib/apixis-redirect.ts`, changes to `lib/apixis-login.ts`, and a new test `lib/__tests__/apixis-redirect.test.mjs`. Undo: `git revert 8d09c4a`.
- **2026-09-30 02:34, Claude, PR #13** (`claude/awesome-newton-3tygzi`, merge `19a6ce8`): re-synced the Apixis kits. Login now uses verifyOtp type `email`, `lib/apixis-wallet.ts` moves to SDK v3.1, and the world kit is updated. Also deleted `lib/apixis-wallet.ts.bak`. Undo: `git revert 19a6ce8`.
- **2026-09-30 02:56, Claude, PR #14** (same branch, merge `467144d`): Cixy now uses the shared family persona core (new `lib/apixis-cixy.js`). Provider errors return a calm 503/429 reply instead of the vendor error. Undo: `git revert 467144d`.
- **2026-10-01 20:56, Claude, PR #15** (same branch, merge `148d468`): `.env.example` now lists every env var the code reads. No code changes. Undo: `git revert 148d468`.
- **2026-10-01 23:19–23:20, Claude (Claude Code), PR closures in the family cleanup** (51 PRs closed across repos): two of them are Launchixis PRs.
  - Closed #8 (`launchixis/notes-refresh-0927`, my 9/27 docs refresh). Reason given: outdated, and `ApixisWallet/docs/FAMILY_STATUS.md` is the live board.
  - Closed #2 (`cursor/cixy-wardrobe-stub-7e94`, the paused Cixy wardrobe stub).
  - Both branches are kept. Undo: reopen the PR.
- **2026-10-02 02:22, Codex, PR #16** (`codex/apixis-companies-20261002`, merge `de8f99e`): new `/companies` page (Apixis Companies directory).
  - New files: `app/companies/page.jsx` and `companies.css`.
  - New images in `public/companies/`: `recovra.jpg` and `scenes-1..5.jpg`.
  - `app/board.jsx` now links to the page.
  - Undo: `git revert de8f99e`.
- **2026-10-02 02:47, Codex, PR #17** (`codex/refine-companies-motion-20261002`, merge `0708d0c`): reworked the Companies card animation and matched the copy to the directory. Undo: `git revert 0708d0c`.
- **2026-10-02 03:19, Codex, PR #18** (`codex/fix-recovra-company-link-20261002`, merge `7d35d63`): fixed the Recovra link on `/companies`. **This is the current production commit.** Undo: `git revert 7d35d63`.
- **Env:** `ADMIN_EMAILS` on the Launchixis Vercel project is set to Awad's two addresses (source: `FAMILY_STATUS.md`, hub). This env change doesn't appear in git history.
- **Known open items (not changed, report only):**
  - `lib/cixy.js` still sends `anthropic-version: 2024-06-15`, and prod `/api/cixy` returns 503 "Cixy is resting".
  - `docs/LAUNCH_NOTES.md` is dated 9/25 and out of date.
  - Redeem returns 409 "not on sale" by design.
- **This entry:** a notes-only commit that touches only `NOTES/GROK.md`. Undo: revert this commit.

## 2026-10-04 (CT) — Grok: owner admin allowlist (alaidaroosawad@gmail.com, awad@apixis.dev)
- What: Awad's rule — both owner emails are Launchixis admin as soon as they sign in with a verified email, by any method. How admin works: email allowlist `ADMIN_EMAILS` (Vercel env, already `awad@apixis.dev,alaidaroosawad@gmail.com`) via `parseAdminList()` / `isAdminEmail()` (`lib/auth.js`), used by `requireAdminUser()` for launch writes (`/api/launches`) and the `admin` flag in `/api/auth/me`. Before, the code fallback was awad@apixis.dev only, and only when the env was empty. Now both owner emails are always in the list (env adds, never removes), still case-insensitive, and admin needs a confirmed email. Nobody else's access changed. No accounts or passwords were created.
- Where: `lib/auth.js`, `lib/server-auth.js`, `app/api/auth/me/route.js`, `tests/auth.test.mjs`. Vercel env unchanged.
- Who: Grok.
- Undo: `git revert <squash SHA>`.

## 2026-10-04 (CT) — Grok Bot: Feed tab on Launchixis (PR open, NOT merged)
- Why: Awad asked for the Socixis Social family feed as a Feed tab on every Ixis site. Awad put feed changes on hold, so this PR is for preview review only; do not merge until Awad says so.
- What: new public `/feed` page in Launchixis's own shell (same header, footer, fonts, colors and buttons). For You is the unfiltered mixed feed from every Apixis company with source-site badges and AI labels; Following, Search · Trending and You tabs; video/photo/text posts, like, comment, follow, save, share, report, tips and boosts in Ixis. Signed-out visitors can browse; the 4th tab says "You" and shows a sign-in card (Apixis ID). Text-only posts use the site's body font, wrap long words and size to their content; media posts keep the full-height layout; feed modals sit above everything.
- Where: `app/feed/` (page with the launch board's own header pills and footer from `app/board.jsx`, Launchixis skin, `feed.css` mapped to Launchixis tokens), `feed-client/` (shared client), `app/api/feed-session/route.js`, "Feed" pill in `app/board.jsx`, and `data-floating-widget` on the Cixy bubble (`app/cixy.jsx`) so it hides while a feed modal is open.
- Backend: https://www.apixis.dev/api/feed. `/api/feed-session` calls POST /api/feed/session server-side with the existing `APIXIS_WORLD_KEY` + X-Apixis-Client/Sub/Email and returns the short-lived fdt_ token. No new env vars, no DB change, no SVGs.
- Who: Grok Bot (for Awad).
- Undo: close this PR, or `git revert <squash sha>` if it is ever merged.

## 2026-10-04 19:00 (CT) — Grok Bot: Feed phone tab fit (same PR, still NOT merged)
- What: at 375px the 4th "You" tab was pushed off-screen by "Search · Trending". Under 560px the tab now reads "Search", tabs are tighter, and if a wide site font still can't fit the tabs and "+ Post" on one row, Post drops to its own row instead of covering "You". Desktop is unchanged; the site's colors, fonts and buttons are untouched; no SVGs.
- Where: feed client `FeedView.tsx` (tab label) and the shared layout section of the site's feed CSS.
- Who: Grok Bot (for Awad). No merge, no production deploy.
- Undo: revert this commit on the PR branch.
## 2026-10-04 catch-up provenance (CT)

The entries below record the day's observed commits and merged PRs. Existing detailed entries above remain the change descriptions; this section supplies exact provenance and undo pointers.

### Commits
- `6329f61` (2026-10-04T17:47:53-05:00, 313aidaroos; alaidaroosawad@gmail.com) — Owner admin allowlist: both owner emails always admin; verified email required (#19). Undo: undo via the merged PR below: git revert 6329f61.

### Merged PRs
- PR #19, merge `6329f61`, `grok/owner-admin-allowlist` → `main`, merged 2026-10-04 CT by 313aidaroos: Owner admin allowlist for alaidaroosawad@gmail.com and awad@apixis.dev. Undo: `git revert 6329f61`.

## 2026-10-04 (CT) — Grok (Developer Bot hub): Cixy persona v2 sync + Ominix link
- What: lib/apixis-cixy.js (JS port): replaced the v1 Cixy kit (Muslim identity, Salam/Insha'Allah lines, halal 'clean recommendations') with v2. lib/cixy.js: removed 'Halal-Conscious by Default' block (alcohol/pork/gambling/riba, 'not a scholar'); chat welcome now 'Hello!' without Insha'Allah. Added religious-terms guard test. Ominix link on /companies now https://ominix-app.vercel.app (URL string only; no SVG/design change).
- Files: app/cixy.jsx app/companies/page.jsx lib/apixis-cixy.js lib/cixy.js tests/cixy.test.mjs 
- Why: Awad's lock — no religious content in Cixy on any product except Halaxis; she declines only genuinely harmful, deceptive or illegal content, never on religious grounds (9/30). Kit = ApixisWallet `sdk/apixis-cixy.*` v2 (3a22244, PR #50) with two hub edits pending canonical: the religion-derived "clean recommendations" rule (gambling) is replaced by "decline only harmful, deceptive or illegal, never on religious grounds", and the character line reads "draws on Arab culture". Ominix links point to https://ominix-app.vercel.app (checked 200 on 2026-10-04 ~6:55 PM CT).
- Who: Grok (Developer Bot hub), branch `grok/cixy-v2-20261004`, one squash-merged PR.
- Undo: `git revert <squash sha of this PR>` (sha recorded in the PR), then redeploy prod.

## 2026-10-04 19:13 (CT) — Grok Bot: Feed PR #20 approved for production by Awad
- Why: Awad said "make it live" at 7:13 PM CT on Oct 4, 2026, approving the squash-merge of this PR and the production deploy that follows from main.
- What: squash-merge of PR #20 (feed files + Feed nav entry only); Vercel's Git integration deploys main to production.
- Who: Grok Bot (for Awad).
- Undo: `git revert <squash sha of PR #20>` on main and push (the squash sha is on the PR page and in /workspace/feed/STATUS.md), or in Vercel promote the previous production deployment (instant rollback) and then revert.

## 2026-10-04 (CT) — Grok (Launchixis Lead): Cixy brain fixed
- **Why Cixy said "resting":** production logs showed `Anthropic API error: 400 invalid_request_error` on every `/api/cixy` call. `lib/cixy.js` sent `anthropic-version: 2024-06-15`, and Anthropic rejects that with "is not a valid version". The key (`ANTHROPIC_API_KEY`, updated 10/4) and the model `claude-sonnet-5` are both fine.
- **Second bug, caught in testing:** `claude-sonnet-5` returns a thinking block first, so reading `content[0].text` would give an empty reply.
- **What changed** (`lib/cixy.js` only):
  - The header is now `2023-06-01`.
  - The model is `AI_MODEL`, then `ANTHROPIC_MODEL`, then `claude-sonnet-5`.
  - The reply joins only the `text` blocks.
  - The shared persona (`lib/apixis-cixy.js`, v2 from #22) is untouched.
- **Env:** none changed. Launchixis has no `AI_MODEL` set, and the default is `claude-sonnet-5`.
- **Verified:** a local call with the shared key returned a real answer, and `tests/cixy.test.mjs` passes 4/4. Production smoke test is noted below once deployed.
- **Who:** Grok (Launchixis Lead), at Developer Bot's request for Awad.
- **Undo:** `git revert` the squash merge of branch `grok/cixy-anthropic-version`.

## 2026-10-04 7:25 PM CT — Grok (Launchixis Lead): Cixy fix merged + prod smoke
- What: squash-merged PR #23 → main `d6feb77` (lib/cixy.js: anthropic-version 2023-06-01, model from AI_MODEL/ANTHROPIC_MODEL with default claude-sonnet-5, reply joins only text blocks).
- Prod smoke: POST https://launchixis.vercel.app/api/cixy {"message":"hi"} returned a real Cixy greeting (no "resting" fallback). /feed 200, / 200.
- Env: no change. ANTHROPIC_API_KEY already set; AI_MODEL not set (code default covers it).
- Undo: `git revert d6feb77` (Cixy goes back to the broken 2024-06-15 header).

## 2026-10-04 evening provenance, 6:57 to 9:25 PM (CT)

Recorded by Grok (Developer Bot, notes and status sync at 9:25 PM CT). Every change below already has a detailed entry in this file or in the matching lead note; this section adds the exact commit, PR number, and undo pointer. All commits were pushed under the shared `313aidaroos` GitHub account; the detailed entries say which bot or lead made each one. Text only, no code or settings changed.

- 7:06 PM, PR #22, `db21603`: Cixy persona v2 sync (no religious content outside Halaxis) + Ominix link to ominix-app.vercel.app. Undo: `git revert db21603` on `main`, then redeploy production.
- 7:17 PM, PR #20, `eb0f2c6`: Feed tab: Socixis Social family feed at /feed. Undo: `git revert eb0f2c6` on `main`, then redeploy production.
- 7:21 PM, PR #23, `d6feb77`: Cixy: fix invalid anthropic-version so the AI brain answers. Undo: `git revert d6feb77` on `main`, then redeploy production.
- 7:22 PM, `9068100`: NOTES: Cixy fix merged + prod smoke (Grok). Undo: nothing to undo in code; delete or edit the note text.

## 2026-10-04 (CT) — Grok: new accounts only through Apixis ID (branch `grok/apixis-id-only-signup`)
- Approval: Awad said go at 10:00 PM CT, Oct 4 2026 ("every Ixis product must allow NEW account creation only through Apixis ID", the shared Wallet SSO at apixis-wallet.vercel.app/sso/authorize).
- What changed: Email magic links (`app/api/auth/magic-link/route.js`) now pass `shouldCreateUser: false` (it used the Supabase default, which creates users): existing accounts still get a link; a brand-new email gets "No Launchixis account uses this email yet… use Sign in with Apixis" (+ `apixis_id_url`, 404). `/login` lede says the email link is for existing accounts. No password signup exists. `/signup` is not a route (404, unchanged).
- Not changed: Supabase project setting "Allow new users to sign up" stays ON (Apixis SSO callback may create users through it). Theme, layout and styles unchanged. No Wallet, Stripe or Cixy files touched.
- Undo: `git revert <squash sha of this PR>` (the sha is recorded in the PR and in /workspace/apixisid/STATUS.md on the box).

## 2026-10-05 overnight provenance, Oct 4 9:35 PM to Oct 5 12:25 AM (CT)

Recorded by Grok (Developer Bot, notes and status sync at 12:25 AM CT on Oct 5). Each change below either has its own detailed entry earlier in this file (written by whoever made it) or is described here. Commits under the shared `313aidaroos` account were made by the bot or lead named in the detailed entry. Every production deployment for this repo was Ready at the time of this sync. Text only, no code or settings changed.

- Oct 4 10:29 PM, PR #24, `4cb5140`: Apixis ID is the only way to create a Launchixis account. Undo: `git revert 4cb5140` on `main`, then redeploy production.

## 2026-10-14 (CT) — Grok (Launchixis Lead): launch readiness doc
- What/where: docs/LAUNCH_READINESS_2027-01-01.md (done / to do with owner / needs Awad). Docs only.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Undo: `git revert` the squash commit of branch `grok/launch-readiness-2027-01-01`.

## 2026-10-14 (CT) — Grok (Launchixis Lead): Footer 'Other Ixis companies' (13 links, all HTTP 200 on 10-14; Recovra omitted: recovra-three.vercel.app returns 404) + nav icons SVG→text glyphs (no-SVG lock)
- What/where: components/StudioShell.jsx, app/studio.css; the 9 inline <svg> on /companies were the StudioShell nav icons
- Who: Grok (Launchixis Lead) via CloudAgent.
- Link re-check 2026-10-14: all 13 footer URLs returned HTTP 200. Recovra (`https://recovra-three.vercel.app`) still returns 404 and stays omitted. No other dead links to drop.
- Undo: `git revert` the squash commit of branch `grok/footer-ixis-companies-no-svg`.

## 2026-10-14 (CT) — Grok (Launchixis Lead): repo cleanups from Claude list
- What/where: removed archive/landing-pack.html (unreferenced); README checks + payment rules section (Apixis ID, Ixis through the Wallet, and card-or-Ixis staying off until Stripe price ids are set). typescript/@types/node already in devDependencies (verified, no change). supabase/schema.sql NOT added: needs a live schema dump; the repo now has supabase/migrations/20261006013826_customer_workspaces.sql.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Undo: `git revert` the squash commit of branch `grok/cleanups-claude-list`.

## 2026-10-14 (CT) — Grok (Launchixis Lead): card or Ixis checkout
- What: Customers pay by card (Stripe Checkout) or Ixis (existing Wallet reserve/capture). One Stripe account, Apixis Dev LLC. Each sku has its own price id from env. Metadata on the Checkout Session, PaymentIntent or Subscription, and the required Price metadata, is `product=launchixis` plus the sku. Subscriptions (Launch Ops Seat, Enterprise Launch Suite) use Stripe `mode=subscription`. A paid, signature-verified webhook fulfills through the same order claim / provision / capture path as Ixis, then writes `purchase_ledger`. Ixis capture writes that ledger too. Receipts are `GET /api/receipts`. Card buttons on `/pricing` stay disabled until the price env and a Stripe key are both set. New accounts stay Apixis ID only. Theme unchanged.
- Where: `lib/catalog.js`, `lib/card-checkout.js`, `lib/purchase-service.js`, `lib/purchase-store.js`, `lib/product-access.js`, `lib/steps.js`, `lib/cixy.js`, `app/api/checkout/route.js`, `app/api/stripe/webhook/route.js`, `app/api/receipts/route.js`, `app/api/product/route.js`, `app/pricing/page.jsx`, `supabase/migrations/20261014213000_card_or_ixis_ledger.sql`, `.env.example`, `tests/checkout.test.mjs`.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Undo: `git revert` the squash commit of branch `grok/card-or-ixis-checkout`. Do not apply the migration on production until Awad says yes. Card prices were not created.

## 2026-10-14 (CT) — Grok (Launchixis Lead): combined launch-prep branch
- What/where: `grok/launch-prep-combined` carries #32 (footer, nav text glyphs), #33 (remove archive/landing-pack.html, README), and #34 (card or Ixis). NOTES and the changelog keep every entry. README keeps the card-or-Ixis purchase paragraph and the checks/payments section.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Not done: migration `20261014213000_card_or_ixis_ledger.sql` is in the branch and was not applied. No env values were set or changed.
- Undo: close the combined PR without merging.

## 2026-10-17 (CT) — Grok (Launchixis Lead): schema record, world clients, purchase smoke
- What: `supabase/schema.sql` is a schema-only record of the public tables. `lib/apixis-world.ts` lists the clients Apixis.dev accepts as `from`, including `aidaroosholding` and `pinixis`, and still says 1,000 starter Ixis. `scripts/smoke-purchase.mjs` (`npm run smoke:purchase`) checks Ixis checkout against a fake Wallet, card checkout disabled when price env is unset, and a receipt plus `purchase_ledger` row in test mode.
- Where: `supabase/schema.sql`, `lib/apixis-world.ts`, `tests/apixis-world.test.mjs`, `scripts/smoke-purchase.mjs`, `package.json`, `eslint.config.mjs`.
- Schema method: rebuilt from `scripts/schema.sql` plus `supabase/migrations/` in filename order. No database credentials were available, so this is not a live introspection. The file was not applied to any project.
- World kit: `313aidaroos/Apixis.dev` is private to this checkout. The allowlist was taken from the live canonical module `https://www.apixis.dev/js/apixis-clients.js` (the list the `/enter` server validates). The helper keeps the family `enterApixisUrl` shape and the 1,000 starter Ixis sentence. Launchixis had no `lib/apixis-world-agent.ts`, so there was no stale agent file to replace.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Not done: no migration applied, no env or Stripe values changed, no email sent.
- Undo: `git revert` the commit on branch `grok/launch-prep-2`.

## 2026-10-17 (CT) — Grok (Launchixis Lead): official logo kit
- What: Cut the Launchixis lockup out of the official reference photo into `public/brand/`. `logo-full.png` is the horizontal lockup (mark left, name right). `logo-full-white.png` and `mark-white.png` are the same alpha filled with pure white. The native lockup is 590×70 and the mark is 66×67, so both were scaled up with Lanczos only (about 1.74× and 7.6×). Header uses `logo-full-white.png`. Favicon, apple touch, manifest icons, and the Open Graph image use this kit. `brand.json` holds the sampled ink color `#FCFAF9` and the file list. `banner.png`, `facebook-cover.png`, and `facebook-profile.png` are not in this kit.
- Where: `public/brand/`, `app/layout.jsx`, `app/manifest.js`, `app/studio.css`, `components/StudioShell.jsx`. Deleted `public/brand/launchixis.png`.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Not done: no SVG, no redraw, no merge. The mark above the wordmark in the photo sits on a near-white part of the scene and was not separable, so the icon is the left glyph of the horizontal lockup.
- Undo: `git revert` the commit on branch `grok/official-logo`.

## 2026-10-17 (CT) — Grok (Launchixis Lead): Cixy art out of the brand kit
- What: Moved `cixy-avatar.webp` and `cixy-studio.webp` from `public/brand/` to `public/cixy/` (same names). Header Cixy art and the Cixy button now load `/cixy/…`. `public/brand/` is only the logo kit. `brand.json` never listed these files.
- Where: `public/cixy/`, `app/cixy.jsx`, `components/LaunchHero.jsx`, `public/brand/README.md`.
- Who: Grok (Launchixis Lead) via CloudAgent.
- Not done: no merge, PR stays draft.
- Undo: `git revert` the commit on branch `grok/official-logo`.
