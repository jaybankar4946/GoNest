# GoNest end-to-end launch gates

This document is the release checklist for the four implementation phases. A feature is not launch-ready because a page exists; verify its real data path, permissions, error states, and customer-visible outcome.

## Phase 1 — Discovery and supply

- [ ] Verify production domain and the intended commit SHA before release.
- [ ] Confirm Buy, Rent, New Projects, Agents and search work on desktop and mobile.
- [ ] Confirm city/locality/BHK/budget/purpose filters combine correctly and empty states offer useful recovery.
- [ ] Test owner and agent listing creation, edit, draft, submission, moderation, rejection, publish and archive.
- [ ] Test builder onboarding, project submission, media upload/privacy, configurations and project enquiry inbox.
- [ ] Confirm public pages only show eligible published inventory; never fabricate current availability.
- [ ] Confirm images, map, listing detail, saved homes, contact forms, enquiry and visit booking.
- [ ] Confirm demo inventory is visibly labelled and excluded from genuine live-offer claims.

## Phase 2 — Trust, privacy and transparent costs

- [ ] Inventory all exposed tables, RLS policies, grants, views, triggers and SECURITY DEFINER functions.
- [ ] For each privileged function, verify fixed search_path, least privilege, ownership checks and execute grants.
- [ ] Test anonymous, buyer, owner, agent, builder and admin access separately.
- [ ] Confirm phone, email, private documents, leads and visits are not exposed to unauthorized roles.
- [ ] Test listing reports, moderation audit history and reasoned trust statuses.
- [ ] Show the specific check and date behind each verification label; avoid implying legal-title guarantees.
- [ ] Display rent, refundable deposit, brokerage, maintenance and agreement charges distinctly.
- [ ] Display sale price, confirmed/estimated statutory charges, legal costs and other disclosed charges distinctly.
- [ ] Verify source provenance and timestamps for project/inventory claims.

## Phase 3 — Customer transaction journeys

- [ ] Validate the rental checklist from enquiry through signed agreement, payment receipt, move-in inspection and handover.
- [ ] Validate resale milestones for offer, due diligence, financing, agreement, registration and possession.
- [ ] Validate builder journey for project enquiry, unit-specific availability confirmation, cost sheet and site visit.
- [ ] Persist milestones to an authenticated server-side record before describing them as shared/account-synced.
- [ ] Keep estimates clearly marked; do not represent a checklist as legal advice or a completed transaction.
- [ ] Test cancellation, stale inventory, failed uploads, duplicate submissions and partial completion.

## Phase 4 — Operations and scale

- [ ] Verify lead/visit notifications and retry/failure visibility.
- [ ] Verify admin moderation, complaints, audit trail and escalation.
- [ ] Verify SEO metadata, canonical URLs, sitemap, robots and sample-page noindex rules.
- [ ] Run production build, type checks, lint where configured, accessibility checks and end-to-end smoke tests.
- [ ] Check database performance advisories and index coverage on high-volume query paths.
- [ ] Configure uptime/error monitoring and a rollback plan.
- [ ] Confirm privacy/terms, account deletion, consent capture and retention handling.
- [ ] Obtain explicit human approval before promoting the tested release to the production domain.

## Release rule

Do not promote if any critical security test fails, if sample inventory can be mistaken for a genuine offer, if a property enquiry/visit path fails, or if the production build does not pass. Record evidence and the tested commit for every release.
