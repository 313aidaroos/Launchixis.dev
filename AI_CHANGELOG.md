# AI Change Log

## Rules for AI models, bots, and agents

If you are an AI (Claude, ChatGPT, Grok, Gemini, Copilot, Cursor, JunoAI, or any other model, bot, or agent) and you add, modify, or delete anything in this repository, you **must** append a dated entry to this file describing what you changed and why — one entry per work session, no exceptions. This log is how the repository owner tracks what every AI did. Human commits do not need entries.

Entry format:

## YYYY-MM-DD — <your name/model>
- Changed: <files or area>
- Why: <reason>

---

## 2026-09-28 — JunoAI
- Changed: created this file
- Why: owner's standing rule — every AI that touches this repo must log its changes here

## 2026-09-28 — JunoAI
- Changed: Added .github/workflows/ci.yml — thin caller of the shared reusable workflow 313aidaroos/github-actions/.github/workflows/node-ci.yml@main (checkout → Node 20 → npm ci → lint/typecheck/test/build).
- Why: Standardize CI across repos via the shared reusable workflow.


## 2026-09-30 — Codex — Tester readiness: shared-login redirects

- Copied the canonical ApixisWallet local-redirect validator and used it at login start and callback. Preserved this app’s existing Supabase adapter and routes.
- Added regression cases for external URLs, backslashes, encoded separators/control characters and normal return destinations. No design changes.

## 2026-09-30 — Claude (branch claude/awesome-newton-3tygzi)
- Changed: `lib/apixis-login.ts` verifies with `type: "email"` (D16; this copy keeps its extra env fallbacks). `lib/apixis-wallet.ts` → SDK v3.1. `lib/apixis-world*.ts` re-synced (15 clients, 1,000 starter Ixis). Removed stale `lib/apixis-wallet.ts.bak`.
- Why: family backend pass per Awad's 2026-09-30 decisions (ApixisWallet/AGENTS.md §0c D11–D16; live board: ApixisWallet/docs/FAMILY_STATUS.md). One SDK, one login kit, one world kit — copied from canonical, never patched by hand.

## 2026-09-30 (night pass) — Claude
- Changed: Cixy prompt now starts with the shared family core from `lib/apixis-cixy` (copied from `ApixisWallet/sdk/apixis-cixy`); only the product role stays site-specific. Greeting policy is the family rule (match the person, never open with salaam). Provider failures (no key, out of credit, 429, 5xx) answer `cixyUnavailableReply()` — a calm sentence with HTTP 503/429, never the vendor error.
- Why: Awad's overnight instruction — all backend and security done, one Cixy persona everywhere (ApixisWallet/docs/CIXY.md, sdk/apixis-cixy.*), agents on the same page (ApixisWallet/docs/FAMILY_STATUS.md).

## 2026-10-02 — Claude (Claude Code)
- Changed: `.env.example` now lists every env var the code reads (missing names appended with a one-line note each).
- Why: so the owner can add keys in Vercel from one complete list. No code changed.

## 2026-10-04 — Claude (Claude Code, full-portfolio review)
- Changed: `NOTES/CLAUDE.md` — this repo's slice of the 24-repo review (what is live, what is open, who owns each item, drift found). No code, env, database or deploy changes.
- Why: Awad asked for every repo to be read twice with a done / to-do / owner status, and for the notes in each repo to be updated. Notes only; Awad approved the merge on 2026-10-04.

## 2026-10-04 — Grok (Launchixis Lead)
- Changed: `lib/cixy.js`. The anthropic-version header is now 2023-06-01 (was invalid 2024-06-15), the model reads AI_MODEL then ANTHROPIC_MODEL then claude-sonnet-5, and replies join text blocks only.
- Why: Cixy answered "resting" on every call because Anthropic returned 400 for the bad version header.

## 2026-10-05 — Codex: private workspaces and customer checklist delivery

Owner requested the assessment improvements and merge. Added a private admin operations board and one owner-scoped customer workspace; preserved existing family records as admin-only. Fixed the email callback external redirect and failed-session handling. Upgraded Next.js/React and replaced vulnerable lint dependencies; added lint/typecheck, redirect, ownership, SQL, payment-recovery and production-route integration checks. Implemented the existing 1,000-Ixis checklist product with a durable downloadable guide, Wallet entitlements, idempotent purchase recovery, and versioned saves. Added admin support intake/status queue with in-app alerts and truthful receipt messaging. Cixy now uses authorized launch context and bounded conversation history; limits are atomic in Supabase. Removed automatic seeding from reads and documented rollout/recovery. Other SKUs remain disabled until their actual services exist. Shared Wallet SDK and prices unchanged.

- Release verification: customer browser flow passed with an isolated fake Wallet; migration applied with 14 internal launches and 3 support tickets preserved. CI uses existing shared workflow hooks (unit + SQL tests, build, HTTP integration and audit). Wrapped workspace navigation to keep controls visible on narrow screens.

## 2026-10-05 — Codex: prismatic launch studio

- Changed: introduced a shared responsive studio shell across the workspace, companies, community, pricing, sign-in, support and admin pages. Added the approved transparent rainbow Launchixis logo, Cixy hero art and avatar, consistent typography, colorful accents, accessible navigation, keyboard focus and reduced-motion support.
- Changed: organized the existing customer checklist into four stages with real progress, next-step guidance, notes and guide downloads. Preserved saves, checkout, authentication and owner isolation; protected unsaved edits when switching or reloading workspaces.
- Preserved: all 15 Apixis company entries and their original artwork/crop mappings. Shared Wallet/login SDKs, prices and database behavior remain unchanged.
- Why: owner approved the colorful design and requested consistent pages, embedded logo without a square, Cixy presence, retained company images, verification and merge.

## 2026-10-05 — Codex: company artwork without SVG badges

- Changed: removed the SVG badges and unused decorative orbit/spark markup from company cards at the owner's request. Original company images remain intact.
- Animation status: prepared five image references for Higgsfield; all five generation submissions were rejected for insufficient credits. Zero video jobs were created. No placeholder videos or simulated SVG animations were added.

## 2026-10-05 — Codex: reuse existing Higgsfield company animations

- Corrected the previous generation blocker: owner pointed out the animations already existed. Found six completed Higgsfield jobs matching all 15 current company illustrations; reused them without new generation.
- Changed: cropped the sprite videos at their actual panel boundaries and optimized fifteen silent H.264 clips. Added visible-card playback, pause/resume with a saved preference, background-tab pausing, reduced-motion/data-saver fallbacks, and original-image fallback on loading or video failure. Company card artwork contains no SVG.
- Why: complete the owner's requested company animations while preserving the approved artwork and avoiding duplicate generation.

## 2026-10-06 — Claude (family lead): AI Receptionist notes (D18)
- Changed: AI Receptionist section in the family notes (see `docs/AI_RECEPTIONIST.md` in ApixisWallet); notes only, no code.
- Why: Awad approved an AI Receptionist add-on at $100/month for every customer-facing family site and asked every bot and agent to follow one plan.
- 2026-10-14 — Grok (Launchixis Lead) via CloudAgent: launch readiness doc for 2027-01-01 (branch grok/launch-readiness-2027-01-01). Docs only.
- 2026-10-14 — Grok (Launchixis Lead) via CloudAgent: remove archive/landing-pack.html and expand the README with checks and payment rules (branch grok/cleanups-claude-list).
