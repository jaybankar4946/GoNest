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

## Execution evidence (2026-10-15)

Environment and scope:
- Tested source branch: `codex/prelaunch-end-to-end-hardening`.
- Tested source SHA: `78670fa89221a8b7e1e141d4a8e8a7afadb27f9e`.
- Vercel reports the preview deployment for this SHA as `READY`; direct unauthenticated requests to its URL redirect to Vercel SSO. This blocks external HTTP/browser testing of the preview itself.
- The sandbox could reach `https://gonest.in`; it could not reach the protected preview without an SSO bypass credential. Production was used only for read-only HTTP smoke checks and read-only/rolled-back database checks.
- No real customer records were created or changed. No production migration was applied in this pass.

Automated checks actually run:
- `npm ci`: PASS; 70 packages installed, npm reported 0 vulnerabilities for the installed dependency tree.
- `npm run build` with public Supabase URL and publishable key: PASS; Next.js production build and TypeScript finished successfully.
- `BASE_URL=https://gonest.in node scripts/smoke-routes.mjs`: PASS, 10/10 checks: home, search, buy, rent, projects, auth, privacy, terms and demo inventory returned HTTP 200; malformed property ID returned 404. This is production public-route smoke testing, not preview E2E.
- Direct anonymous PostgREST read of active, non-sample listings: PASS; 4 rows returned, all active and non-sample.
- Direct anonymous read of profile columns including `email`: BLOCKED as expected (HTTP 401 / permission denied).
- Anonymous booking RPC negative tests: PASS; booking against an archived sample listing returned HTTP 400 `listing_unavailable`; booking without consent returned HTTP 400 `consent_required`. Both calls were rejected before insertion.
- Tracked-file secret-pattern scan (private keys, JWT-shaped literals, common token formats and service-role assignments): PASS with 0 hits. This is a targeted heuristic scan, not a comprehensive secret-scanner guarantee.
- Anonymous `is_admin()` RPC: PASS for negative authorization check; returned `false`.
- Anonymous `get_booked_slots` against an archived sample listing: returned an empty array.
- Database role simulation (transaction-scoped `SET LOCAL ROLE` and JWT claims, rolled back): owner role could not update own profile to admin (RLS rejected); agent role could not call admin listing moderation (function raised “Only admins can moderate listings”); agent saw zero listing reports; admin profile passed `is_admin()`.
- These role checks are database-level simulations, not authenticated browser sessions with separate test accounts. A synthetic buyer login and isolated owner/agent/admin browser sessions were not created because the current preview is SSO-protected and no isolated preview Auth environment or test credentials were available.

Findings / blockers:
- Anonymous listing query currently returns 54 rows: 4 active real listings plus 50 explicitly namespaced `demo-thane-west-*` sample rows that are archived. This matches the current policy's explicit demo exception, but the public demo/archive behavior should be confirmed against intended product behavior.
- Security Advisor still flags five anonymous-callable SECURITY DEFINER functions, nine authenticated-callable SECURITY DEFINER functions, and two RLS-enabled internal tables with no policies. The admin functions inspected enforce `is_admin()`; intentional public RPCs still need an endpoint-by-endpoint decision. Do not treat the advisor findings as resolved.
- Leaked-password protection remains unverified/enabled status is still flagged by Supabase Security Advisor.
- No separate buyer test profile exists in the current profile table snapshot; current profiles found were one admin, three agents and one owner. No test-account passwords or SSO bypass credential were available to this run.
- Authenticated browser journeys, cross-user enquiry/visit visibility with separate login sessions, signup/reset-password flows, image upload, mobile/accessibility checks, and a secret scan remain NOT RUN.
- Two follow-up migrations have been committed to this branch but NOT applied to the connected database:
  - `20261015130000_harden_public_visit_rpc_sample_inventory.sql` — ensures anonymous visit booking and booked-slot lookup reject sample inventory; adds required contact-field validation.
  - `20261015133000_revoke_unneeded_client_table_privileges.sql` — revokes client-role TRUNCATE, REFERENCES and TRIGGER table privileges and updates default privileges.

Release decision:
- NOT READY FOR LAUNCH based on available evidence.
- Preview E2E is blocked by Vercel SSO and lack of separate test-account credentials/environment.
- Do not merge these migrations or promote a release until they are applied to a non-production database and tested, role-based browser E2E passes, remaining security findings are resolved or risk-accepted, and the product owner approves.

## Launch gate

A successful build or smoke test alone is not launch approval. Do not merge/release to production until the authenticated journeys are tested, high-risk security findings are resolved or explicitly risk-accepted, and the product owner explicitly approves launch.
