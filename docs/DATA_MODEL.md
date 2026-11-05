# GoNest Data Model

## Existing domain entities
The schema snapshot and live Supabase table inventory indicate existing entities for profiles, listings, cities, localities, listing images, saved listings, saved searches, leads, visits, and verification/moderation logs. Confirm exact columns and constraints against current migrations before schema changes.

## Core distinction
- **Property:** physical dwelling/unit.
- **Listing:** time-bound offer to rent or sell a property.
- **Party:** owner, authorized agent, or organization responsible for the listing.
- **Evidence:** source and review record supporting a particular verification claim.

The current implementation may combine property and listing fields; split them only when multiple offers, units, or historical listing versions justify the migration cost.

## Required invariants
- Use UUIDs or existing primary-key strategy consistently.
- Use foreign keys and check constraints for valid relationships/statuses.
- Store money in exact numeric types and store currency explicitly.
- Keep timestamps in UTC; display in user-local time.
- Track listing status, purpose, last-confirmed availability, source, and verification evidence.
- Do not treat an agent profile as proof of authority to list a property.
- Protect personal contact details and enquiry data with RLS.
- Prevent users from changing their own role or verification state.
- Add indexes based on real query plans and measured query patterns.

## Candidate future entities
Organizations and memberships, property units, verification evidence, listing versions, listing availability history, fraud reports, moderation actions, notifications, subscriptions, invoices, maintenance requests, and AI task evaluations. Add only when required by a validated workflow.

## Migration discipline
Review `supabase/migrations` and the deployed schema before modifying anything. Make changes with versioned migrations, test them in a non-production environment, review RLS and function grants, then verify after applying. Do not use the schema snapshot as a migration.
