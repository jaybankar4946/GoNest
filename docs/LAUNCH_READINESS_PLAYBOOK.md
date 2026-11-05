# GoNest launch-readiness playbook

Last reviewed: 5 November 2026  
Pilot wedge: Mumbai/MMR, Thane and Pune.

## Launch principle

GoNest should launch as a trusted residential marketplace, not a catalogue of unverified inventory. A record marked `is_sample = false` is not automatically proof of ownership, availability, price, RERA status or authority to list. Keep QA/sample records out of public search.

## Release gates

### Product and trust
- [ ] Demo/sample records are not publicly readable; admin access is enforced by database policy.
- [ ] Decision Centre and Home Finder are restricted. Current client-side UI gating is not a security boundary; implement server-side authorization before treating these pages as protected.
- [ ] Agent directory and profile pages exclude sample profiles.
- [ ] Buyer/renter enquiries persist, show a reference and route to an accountable supplier or GoNest operator.
- [ ] Owner listing submission, photo upload, moderation, edit, pause and archive pass with a real owner account.
- [ ] Agent onboarding, RERA evidence, verification and contact pass with a real agent account.
- [ ] Builder onboarding, project submission, media upload, project review and unit-evidence review pass with a real builder account.
- [ ] Admin actions are protected server-side and leave an audit record.
- [ ] Notification outbox is scheduled, monitored, idempotent and tested using a controlled mailbox.
- [ ] Saved-search alerts respect `notify_enabled` and unsubscribe preferences.
- [ ] Email OTP, password login, Google OAuth and reset-password flows pass with real production configuration.
- [ ] Mobile, keyboard, accessibility, slow-network and failure-state tests pass.
- [ ] Browser E2E tests cover all roles and unauthorized access attempts.

### Listing quality checklist

Every public listing should have a real owner/authorized agent, explicit sale/rent purpose, correct locality and PIN, price and currency, clearly labelled carpet area where known, property facts, permissioned original photos, availability date, last-confirmed timestamp, source/provenance and a moderation decision. Do not treat ambiguous `sqft` as carpet area.

For projects, require the official project/developer identity, RERA reference and source URL, possession/construction status, tower/configuration and current unit-level evidence. A project directory record is not a live unit offer.

## First 14 days: supply

- Start with Mumbai/MMR, Thane and Pune rather than spreading across five cities.
- Build an outreach list of 10 agencies/agents and 20 owners/builders as targets, not claimed partners.
- Ask each supplier for a small batch of their best current listings.
- Record supplier consent, identity/RERA checks, source evidence, locality, contact owner and next follow-up.
- Verify availability before publication and reconfirm it at least weekly.
- Add unit-level project inventory only when builders provide current, traceable evidence.

## First 14 days: demand

- Recruit buyers and renters only in localities where genuine supply exists.
- Capture budget, preferred locality, property type, move-in/possession horizon and contact consent.
- Assign every enquiry to a named operator and supplier.
- Acknowledge immediately; aim for human response within 15 minutes during staffed hours and within 2 business hours outside them.
- Record contact, visit, offer and outcome; do not buy broad traffic before fulfilment works.

## Weekly scorecard

Track real suppliers by type, verified suppliers, approved/active/stale listings, listings with recent availability confirmation, qualified buyer/renter requirements, zero-result searches by locality/budget, unique enquiries, response time, enquiry-to-visit conversion, visit-to-offer outcomes, repeat usage, complaints and takedowns.

Exclude samples, QA accounts, bots and internal traffic. Do not call sessions or raw events MAU, customers, transactions or product-market fit.

## Public launch gate

Move from private pilot to public launch only after role workflows, security checks, notifications and mobile testing pass; real inventory exists in target localities; enquiries reach real suppliers; and response/fulfilment metrics are consistently measured. A successful build is not a marketplace launch.
