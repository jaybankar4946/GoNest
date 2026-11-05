# GoNest MVP Product Requirements

## Objective
Validate whether a focused rental journey can reliably take a renter from search to a real enquiry and viewing, using current and traceable listing information.

## Primary journey
1. Visitor selects location and rental preferences.
2. Search returns database-backed listings with clear price, location, property attributes, freshness, and verification explanation.
3. Visitor opens a property detail page and sees known facts separately from missing or unverified information.
4. Visitor signs in when required and submits an enquiry or viewing request.
5. Authorized owner/agent can review the request and update availability.
6. Admin can review reports and suspicious/stale listings.

## MVP capabilities
- Existing authentication and profile flow, after security review.
- Search, filters, property detail, saved listings.
- Enquiry and viewing-request workflow.
- Listing owner/agent dashboard sufficient to update availability and respond.
- Basic admin moderation and audit history.
- Freshness metadata and listing status explanations.
- Mobile-first responsive UI and accessible forms.
- Seed data labelled as demo-only in development.

## Acceptance criteria
- Search filters query Supabase records, not hardcoded arrays.
- A public user sees only listings permitted by database policy.
- Private enquiry/contact information is visible only to authorized participants and administrators.
- Unauthorized writes fail at the database boundary, not only through hidden UI controls.
- A viewing request has a defined status lifecycle and cannot silently duplicate on retries.
- Stale listing policy is documented and tested.
- Errors and missing configuration have safe, actionable states.
- Critical flows have automated tests before pilot.

## Success measures
Instrument funnel steps: search submitted, result opened, save, enquiry started/submitted, owner response, viewing requested, viewing completed. Establish baseline before setting aggressive conversion targets.

## Not in MVP
Transaction escrow, payments, lease signing, title/legal verification, credit/tenant screening, automated valuations, unrestricted AI agents, and paid result manipulation.
