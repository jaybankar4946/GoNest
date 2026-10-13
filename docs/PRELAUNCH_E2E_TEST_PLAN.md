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

- [ ] Review each SECURITY DEFINER RPC for intended public exposure, input validation, authorization, abuse resistance and data leakage.
- [ ] Enable Supabase leaked-password protection in Auth settings; current Security Advisor reports it disabled.
- [ ] Review whether `events` and `notification_outbox` should remain inaccessible through client roles (RLS enabled, no policies); do not add permissive policies just to silence the advisor.
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

## Current execution status (2026-10-13)

- Local production build passed on the branch commit after supplying the public Supabase URL and publishable key as environment variables. A build with those variables absent fails during static generation of `/sitemap.xml`; ensure Vercel production/preview environment variables are configured.
- The smoke script passed all 10 checks against the current live production domain `https://gonest.in`: 9 expected public routes returned 200 and a malformed property ID returned 404. This is a limited HTTP route check, not authenticated browser E2E.
- Latest branch preview deployment `https://gonest-6i07hn0e3-jackfink9663-hues-projects.vercel.app` is READY at commit `9fbf351f00221be0a9be276f702115b9f624d149`, but Vercel SSO protection redirects unauthenticated HTTP requests to sign-in, so the route smoke script could not validate the preview URL directly.
- Supabase access-hardening migration was applied to the connected project. Public listing reads are limited to active real listings plus the explicit `demo-thane-west-*` sample namespace. Verified counts at that check: 4 active real listings, 0 active sample listings, 50 namespaced demo rows.
- Trigger-based protection for leads/visits is active; the trigger function is no longer callable as an RPC by `anon` or `authenticated`.
- Current Supabase Security Advisor still reports leaked-password protection disabled; 5 SECURITY DEFINER functions callable by anon (including visit booking, booked-slot lookup, view counting, admin-status helper and analytics); 9 authenticated-callable SECURITY DEFINER findings (including admin RPCs); and 2 RLS-enabled internal tables with no policies. Some public RPCs may be intentional, but their behavior and exposure must be reviewed before launch.
- Authenticated buyer/owner/agent/admin browser E2E tests, secret scan, accessibility/mobile checks, and operational readiness checks are not confirmed.

## Launch gate

A successful build or smoke test alone is not launch approval. Do not merge/release to production until the authenticated journeys are tested, high-risk security findings are resolved or explicitly risk-accepted, and the product owner explicitly approves launch.
