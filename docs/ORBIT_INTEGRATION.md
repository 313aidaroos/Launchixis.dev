# Apixis Orbit — Launchixis integration handoff

**Status: NOT CONNECTED**. This PR is a safe scoped implementation brief and capability manifest, with no production API or user behavior changed.

## What exists today
`README.md` says the paid customer product is a private, editable 13-step launch checklist. This is a planning product: it does not deploy a business site or provide a human operator by itself.

## Proposed scope
- Capability: `launchixis.checklist.read` (`read`, planned).
Read the signed-in customer's launch checklist state, then provide a plain-language progress summary in Orbit without publishing or deploying a company.

## Concrete work to implement next
1. Bind Orbit principal to the actual owned customer workspace; preserve admin-only legacy rows.
2. Use existing checklist entitlement and ownership checks; return no details to another customer.
3. Return completed/remaining steps with a record timestamp, not speculative launch claims.
4. Keep launch/deployment and investor introductions as distinct human-approved workflows.
5. Test unrelated customers, expired entitlement and missing workspace.

## Universal Orbit gates
1. The Orbit host uses the **existing Apixis identity** and wallet; this repo does not create another credit ledger, agent registry, checkout or auth provider.
2. Any future adapter needs a dedicated signed service credential, expiry + replay prevention, binding from Apixis ID subject to the **local account or tenant**, and per-resource authorization. The Orbit hub must not impersonate users by supplying emails.
3. Data must be genuine and have a source timestamp and `demo` flag; errors and absent integrations fail closed. User-facing text must distinguish draft, submitted, paid, and verified states.
4. Only read/draft initially. No autonomous outbound messaging, spending, contracts, orders, investments, publishing or settlement.
5. Require unit/integration tests for wrong owner, missing creds, no-data response, retried requests and source freshness.
6. Never activate an Orbit capability in Core until product-specific code, tests and owner production configuration are verified.

**This PR provides integration preparation only, not runtime wiring.** See https://github.com/313aidaroos/Apixis.dev/pull/86 for the draft Orbit Core.
