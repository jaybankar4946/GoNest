# GoNest End-to-End Product Journeys

## Product promise
Help people find a suitable property, understand what is known and what remains unverified, connect with accountable people, and move through the transaction with less uncertainty. Start with Mumbai/MMR and Pune. Never fabricate listings, availability, prices, credentials, reviews, or verification.

## Public information architecture
- Home: city and intent search, clear entry paths for home seekers, owners/agents, and developers.
- Buy / Rent: location, budget, property type, BHK, furnishing, possession/availability, size, and relevant preference filters.
- Search results: list/map where supported, sort and filter controls, save/search actions, visible freshness and verification status.
- Property details: real photos and attributes, locality/map, rent/sale price, availability and last-updated date, known limitations, estimated transaction costs, seller/agent identity and verification scope, enquiry and viewing actions, report-listing path, comparable listings where real.
- New projects: developer/project details, possession status/date when evidenced, configuration, amenities, price and charges where sourced, RERA details when applicable, project enquiry.
- Agent directory: profile, service area, relevant credentials, active listings and evidence-based reputation.
- Help/trust: verification definitions, reporting, privacy, terms, safety guidance and complaint resolution.

## Demand journey: tenant / buyer
1. Choose Rent, Buy or New Projects and target locality.
2. Search with filters; show meaningful empty states and allow broadening the search.
3. Review details, freshness, evidence and uncertainty; do not imply ownership/title checks that were not done.
4. Compare total estimated cost. Separate one-time, recurring, refundable and conditional costs; show assumptions and allow editing where appropriate.
5. Save and compare homes; retain searches and preferences with clear consent.
6. Enquire with consent; prevent spam and protect contact information.
7. Request a viewing; show available slots, timezone, confirmation and cancellation/reschedule options.
8. Track response and visit status; provide reminders and report/no-show options.
9. Review terms, documents and payments with qualified professional support where needed; never imply legal advice or completion unless verified.
10. Record move-in/handover checklist, property condition, meter readings and agreed payments when workflow is available.
11. Support maintenance, renewal, notice period, move-out inspection and deposit reconciliation only when supported by real features.

## Supply journey: owner
1. Sign up and choose the correct account role; protect role changes.
2. Create listing with property type, address/locality, rent or sale price, availability, furnishing, lease/lock-in terms, restrictions, amenities, photos and contact preferences.
3. Verify authority to list and identity; collect only necessary documents and restrict their access.
4. Show validation, missing information, duplicate/stale warnings and draft preview.
5. Submit for review; explain pending, rejected and approved states with next actions.
6. Publish only when moderation requirements pass; show what was checked and when.
7. Manage leads, schedule visits, update availability and pause/archive when unavailable.
8. Track agreed brokerage, agreement/registration status and move-in details without presenting estimates as legal quotes.
9. Record maintenance, renewal and move-out events if the feature exists.
10. Reconfirm freshness periodically; automatically suppress stale/unconfirmed listings rather than presenting them as live.

## Supply journey: agent
1. Create professional profile, service area and permitted credentials.
2. Verify identity and credentials where applicable; distinguish user-provided from verified data.
3. Submit listings only with owner/developer authority; detect duplicates and conflicts.
4. Manage leads, response SLAs, viewings, follow-ups and status history.
5. Track deal milestones and agreed brokerage transparently.
6. Build reputation from authentic, policy-compliant outcomes and feedback; no purchased or fabricated ratings.
7. Apply territory/ownership rules only if clearly defined and enforced consistently.

## Supply journey: builder / developer
1. Verify organisation and representative authority.
2. Submit project details, RERA identifiers where applicable, configuration, photos with usage rights, location, amenities, possession status/date, price/charges and source date.
3. Review and approve claims; display unknown/unconfirmed fields honestly.
4. Manage units or availability only where an authorised source supports it; do not infer live inventory from brochure pages.
5. Receive project enquiries and manage response/follow-up.
6. Update prices, availability and possession information with a timestamp and audit trail.

## Admin / operations
- Review queues for listings, agents, builders, reports and suspicious patterns.
- Audit trail for status/verification changes and who made them.
- Duplicate/fraud reports, evidence retention and appeal/review workflow.
- Stale listing reminders and expiry/suppression rules.
- Metrics: verified fresh supply, enquiry response time, viewing completion, conversion, reports, disputes, resolution time and customer effort.
- Least-privilege access, tested RLS policies, secure storage, rate limits, consent and retention controls.
- Clearly labelled sponsored placement; never mix paid placement with organic 'top' or 'verified' rankings.

## Essential UI states
Every flow must support loading, success, validation errors, retryable failure, permission denied, no results, no inventory, pending review, rejected with remediation, stale listing, offline/slow network and mobile layouts. Buttons must have real actions and success states must reflect server-confirmed outcomes.

## Initial release priorities
P0: honest live inventory; listing verification/freshness; role-safe submission; search and property detail; clear cost estimates with assumptions; consented enquiry and visit booking; report listing; RLS/auth checks; mobile responsiveness; analytics and error monitoring.
P1: saved searches/alerts, comparison, agent CRM, renewal reminders, document checklist, property handover and maintenance workflows.
P2: transport/moving integrations, advanced recommendations, automation and wider geographic expansion after local supply quality is proven.

## Launch gates
- No fabricated or unlicensed listing content, photos, reviews or rankings.
- No sample, suspended, rejected or stale/unconfirmed listing exposed as live.
- Test owner, agent, builder, buyer/tenant and admin journeys with separate accounts.
- Verify tenant isolation and least-privilege permissions at database and API layers.
- Verify enquiry consent, spam/rate limits, contact privacy and report handling.
- Check calculations and local legal/tax assumptions with authoritative current sources and qualified review.
- Automated build/lint/type checks pass; smoke tests on mobile and desktop pass.
- Monitor errors and have a rollback plan.
- Only promote to production after preview evidence and critical journey checks pass.
