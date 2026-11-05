# GoNest launch-readiness playbook

Last reviewed: 5 November 2026  
Scope: Mumbai, Thane and Pune controlled pilot

## Launch principle

GoNest should launch as a trusted residential marketplace, not as a catalogue of unverified inventory. Do not publish sample records as real supply. A record being marked `is_sample = false` only means it is not tagged as sample; it does not prove ownership, availability, price, RERA status or authority to list.

## Release gates

### Product and trust gates

- [ ] Browser-controlled demo access is disabled. Sample inventory is not publicly readable through the listings table.
- [ ] Admin-only pages have server-side authorization before any sensitive data or mutation is exposed. The current UI gate is not a security boundary.
- [ ] Public agent directory and profile routes exclude sample profiles.
- [ ] Agent contact form creates a consent-backed GoNest enquiry; the user is told whether GoNest or the agent will receive it.
- [ ] Buyer/renter property enquiries persist and appear to the correct listing owner/agent.
- [ ] Owner listing submission, image upload, moderation, edit, pause and archive workflows pass with a real owner account.
- [ ] Agent profile, RERA submission, verification and enquiry workflows pass with a real agent account.
- [ ] Builder onboarding, project submission, media upload, project review and unit-evidence review pass with a real builder account.
- [ ] Admin review actions are server-authorized and leave an audit record.
- [ ] Notification outbox is scheduled, monitored, idempotent and tested end-to-end with a controlled mailbox.
- [ ] Saved-search notifications respect `notify_enabled` and unsubscribe preferences.
- [ ] Password reset, email OTP, password login and Google OAuth pass with production-configured providers.
- [ ] Mobile, tablet, keyboard, accessibility and slow-network checks pass.
- [ ] A browser E2E suite covers all roles, happy paths, unauthorized paths and failure states.

### Supply quality gates

Every public listing must have:

1. A real owner or authorized agent account.
2. Explicit sale/rent purpose and property type.
3. Correct city, locality and PIN.
4. Price, currency and whether negotiable.
5. Clearly labelled carpet area; do not silently treat ambiguous `sqft` as carpet area.
6. BHK, bathrooms, floor/total floors and furnishing where known.
7. Original, permissioned photos; no stock photos presented as the property.
8. Availability date and last-confirmed timestamp.
9. Source/provenance and supporting evidence stored for moderator review.
10. Moderation decision, reviewer and review timestamp.

For new projects, also require the official project name, developer identity, RERA reference and source URL, possession/construction status, tower/configuration, unit-level inventory evidence and observed-at timestamp. A project directory record is not a live unit offer.

### Demand readiness gates

- Search returns relevant results or a useful no-results path.
- Filters and map/list views remain consistent.
- Listing detail makes verification and availability status unambiguous.
- Contact form validates consent and contact information.
- Enquiry acknowledgement shows a reference and explains who will respond.
- Every enquiry has an accountable owner, response SLA and status.
- Saved searches can be managed and notifications can be switched off.
- Support contact and privacy/data-rights routes are visible.

## Initial pilot operating plan

### Supply: first 14 days

- Focus on Mumbai/MMR, Thane and Pune; do not spread thinly across five cities before local inventory is credible.
- Invite 10 established agencies/agents and 20 individual owners/builders as a starting outreach list, not as claimed partners.
- Prioritise genuine, currently available resale and rental homes over vanity listing counts.
- For every supplier, record: source, consent to publish, role, identity check, RERA check where applicable, service areas, response contact, onboarding status and next follow-up.
- Ask each agent for a small batch of their best current listings first; verify each one before publishing.
- For builders, begin with a verified project page and only add tower/unit availability when the builder supplies current evidence.
- Keep sample/archived inventory in the admin QA workspace only.

### Demand: first 14 days

- Start with a narrow buyer/renter cohort in the same localities where supply is verified.
- Capture requirement, budget, locality, move-in/possession horizon and contact consent.
- Route each enquiry to a named owner in GoNest operations.
- Acknowledge quickly, contact the user, qualify the requirement and record the outcome.
- Do not buy broad traffic until the marketplace can fulfil the demand it creates.

## Weekly operating scorecard

Track counts from database-backed events and CRM records, with sample/QA traffic excluded:

- New real suppliers by type: owners, agents, developers.
- Suppliers identity/RERA checked and approved.
- Real listings submitted, approved, active, stale and removed.
- Listings with source evidence and a recent availability confirmation.
- Qualified buyer and renter requirements.
- Searches with zero results by locality and budget band.
- Property views, enquiry starts, submitted enquiries and unique qualified enquiries.
- Median first-response time and share answered within the SLA.
- Enquiry-to-visit, visit-to-offer and offer-to-closed outcomes.
- Repeat users and repeat suppliers.
- Complaints, suspected fraud, duplicate records and takedowns.

Do not call raw sessions, page views, anonymous events or test accounts MAU, customers, transactions or product-market fit.

## Recommended initial service levels

These are operating targets, not current performance claims:

- Acknowledge an enquiry immediately in-product.
- Human first response within 15 minutes during staffed hours; within 2 business hours outside staffed hours.
- Review a complete listing submission within 1 business day.
- Reconfirm live listing availability at least every 7 days, and sooner for high-demand rental inventory.
- Escalate fraud, impersonation, payment requests and misleading property claims immediately.

## Launch decision

Move from private pilot to public launch only after the product and trust gates pass, real inventory exists in the target localities, enquiries reach real suppliers, and response/fulfilment data is consistently measured. A successful build or deployment alone is not a marketplace launch.
