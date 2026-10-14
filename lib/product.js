export const CHECKLIST_PRODUCT = "launchixis.template.checklist";
export const TEMPLATE_VERSION = 1;
export function launchGuide() {
  return `# Launchixis Launch Checklist — version ${TEMPLATE_VERSION}

One company, one launch. This guide includes an editable private checklist for one company in your Launchixis account. It does not include an operator, deployment service, brand design, or a guarantee of commercial results.

## 1. Name locked
Write three candidate names. Check domain availability and competing products. Record the chosen spelling, audience, and owner before creating accounts.
Evidence: the chosen name and a dated decision in your launch notes.

## 2. One-sentence product
Complete: We help [audience] achieve [outcome] by [specific capability]. Interview three potential users and revise using their words.
Evidence: a one-sentence description that explains the paid deliverable.

## 3. Domain decided
Choose a canonical host. Use the deployment host while DNS is pending. Configure HTTPS and redirect alternate hosts to the canonical one. Verify login return URLs on that host.
Evidence: working HTTPS URL and a recorded DNS owner.

## 4. GitHub repository
Create the repository, document local setup, commit a lockfile, and exclude secrets. Require checks before merging. Store credentials only in your host's environment settings.
Evidence: repository link and a passing CI run.

## 5. Vercel deployment
Connect the repository, configure only this company's environment variables, and create a preview. Run login, persistence, and failure checks before promoting. Record the last known good deployment for rollback.
Evidence: production URL, commit, and rollback reference.

## 6. Waitlist and demand
Create a form stating what people are signing up for. Collect only necessary information, explain how it will be used, and confirm delivery to your team. Define a concrete success measure before paid acquisition.
Evidence: a test submission received by the owner and a measurable launch goal.

## 7. Family identity
Add consistent product naming and the Apixis company attribution. Make navigation, support, and ownership easy to find. Check keyboard navigation and a narrow phone screen.
Evidence: desktop and phone review of the key pages.

## 8. Pricing and fulfillment
State exactly what a customer receives and when. Customers pay by card or with Ixis from the shared Apixis Wallet. Before charging, verify the deliverable exists. Test successful delivery, insufficient balance, retries, and a lost response. Never issue a second charge to recover a missing response.
Evidence: test receipt linked to delivered access; no unfulfilled paid offering enabled.

## 9. Usable product
Walk through the complete main task as a new customer. Check empty, loading, validation, failure, and success states. Remove fake data and disabled actions that appear usable.
Evidence: completed customer task with data still present after reload.

## 10. Login
New Apixis-family accounts use Apixis ID. Test first login, return visits, expired callbacks, sign-out, and return destinations. Keep redirects on approved local paths.
Evidence: successful new-user login and rejected invalid callback.

## 11. Administration and privacy
Separate customer records by verified identity. Check anonymous, customer A, customer B, and admin access. Protect both pages and API routes. Keep internal notes and secrets out of public responses.
Evidence: access matrix with cross-customer reads and writes rejected.

## 12. Support
Provide a working intake form, durable ticket queue, an owner, and visible response status. Test ticket receipt and status updates. Do not claim email delivery without a configured sending service.
Evidence: ticket ID visible in the admin queue and a recorded resolution.

## 13. Isolated environment and final review
Separate production and test credentials. Enable database protections, track migrations, check dependency advisories, and document rollback. Review privacy and terms for the actual service before launch.
Evidence: passing checks, applied migrations, and a signed-off launch decision.

## Working notes
Audience:
Deliverable:
Launch owner:
Target date:
Success measure:
Current blocker:
Next action:
Evidence links:

## Launch-day sequence
1. Verify the deployed commit and all required environment settings.
2. Complete the customer journey with test data.
3. Check support, login, entitlement checks, and rollback readiness.
4. Publish only the offering you can deliver.
5. Monitor errors, fulfillment, and support after release.

Use Cixy for planning advice. Confirm technical and business decisions against your actual service and verified evidence.
`;
}
