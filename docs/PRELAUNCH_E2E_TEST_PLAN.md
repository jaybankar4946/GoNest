# GoNest pre-launch end-to-end verification

This checklist is the acceptance gate for the current Next.js + Supabase implementation. Run it on a Vercel Preview deployment with test accounts and synthetic listings only. Do not use real customer contact details in tests.

## Automated smoke test

From `apps/web`:

```bash
BASE_URL=https://YOUR-PREVIEW-URL node scripts/smoke-routes.mjs
```

The script checks public routes and confirms malformed property IDs return 404. It does not replace authenticated browser tests.

## Customer journeys

- [ ] Home loads with real, active, non-sample listings only; empty/error states are understandable.
- [ ] Buy and Rent preserve purpose when navigating into search.
- [ ] Search by city, locality/text, BHK, type, min/max price and sort; empty result state works.
- [ ] List/map/split view works; load-more does not duplicate or lose results.
- [ ] Property detail shows price, location, photos, key facts, availability/trust wording and report/contact controls.
- [ ] Malformed, archived, suspended, rejected, sold, rented and sample listing IDs return not found.
- [ ] Save/unsave works for signed-in users; anonymous users are directed to sign-in.
- [ ] Enquiry requires consent and valid contact fields; it appears only to the correct listing owner and authorized admins.
- [ ] Visit booking rejects past dates, invalid time slots, duplicate slots, sample listings and inactive listings.
- [ ] Owner can create a draft/pending listing, upload images, edit it, archive it and view enquiries/visits for their own listings only.
- [ ] An owner cannot set their own listing active, featured or verified by editing API requests.
- [ ] Admin review actions (approve, reject, platform verify), report resolution, audit log and funnel metrics require an admin account.
- [ ] Report submission works; report contents and resolution notes are not visible to ordinary users.
- [ ] Profile edits cannot elevate a user to admin or change verification flags.
- [ ] Sign-in, sign-out, reset-password and expired-session flows work on desktop and mobile.

## Security / data checks

- [ ] Review remaining Supabase Security Advisor findings: SECURITY DEFINER RPCs (confirm each is intentionally callable and has authorization checks), disabled leaked-password protection, and internal tables with RLS but no policies.
- [x] Applied access-hardening migration to the connected Supabase project and verified the resulting policies, triggers, and key privileges. Test any follow-up migration in a non-production environment first.
- [ ] Verify public listing reads return active non-sample listings plus only the explicitly namespaced demo inventory.
- [ ] Verify public price history is limited to active, non-sample listings; owners/admins can see their own/authorized records.
- [ ] Verify direct INSERT/RPC attempts for leads and visits against sample/inactive listings fail.
- [x] Verified at database privilege level that anonymous users cannot update notifications and authenticated users can update `read_at` but not `title`. Complete signed-in RLS behavior checks in the browser.
- [ ] Confirm no service-role key or other secret is exposed to browser bundles or committed files.
- [ ] Check RLS policies for leads, visits, saved listings/searches, listing reports, images, profiles, verification log and audit log using separate buyer, owner, agent and admin test accounts.

## Operating readiness

- [ ] Admin queue has a documented evidence standard: source, verifier, check timestamp and expiry/freshness; “platform verified” must not imply legal title guarantee.
- [ ] Reports have an owner, response target and resolution reason.
- [ ] Listing expiry/stale availability process is operational; stale listings are hidden or clearly labeled.
- [ ] Analytics events are privacy-minimized and do not include phone, email or message text.
- [ ] Keyboard navigation, mobile layout, loading/error states and basic accessibility are checked.
- [ ] Record results, screenshots, build SHA and unresolved defects before launch review.

## Current execution status (2026-10-13)\n\n- Supabase access-hardening migration applied to the connected project. Public listing reads are limited to active real listings plus the explicit `demo-thane-west-*` sample namespace. Current counts: 4 active real listings, 0 active sample listings, 50 namespaced demo rows.\n- Trigger-based protection for leads/visits is active; the trigger function is no longer callable as an RPC by `anon` or `authenticated`.\n- A Vercel preview build for an earlier branch commit succeeded. Latest branch changes are still building/queued. HTTP route smoke tests and authenticated browser E2E tests are not yet confirmed.\n- Preview URLs could not be inspected through the available browser access path, so do not interpret a successful build as a passed route test.\n\n## Launch gate

A successful build or smoke test alone is not launch approval. Do not merge/release to production until the automated build and smoke checks pass, the authenticated journeys above are tested, high-risk security findings are resolved, and the product owner explicitly approves launch.
