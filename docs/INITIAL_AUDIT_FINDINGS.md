# Initial Repository and Live-Environment Audit

**Snapshot date:** 2026-10-13  
**Scope:** Read-only repository inspection, Supabase project inventory/advisors, and Vercel access check. No production database or deployment settings were changed.

## Executive summary
GoNest already has meaningful marketplace functionality. The next milestone should be reliability and trust in the rental discovery → enquiry → viewing journey, not a rewrite. Before production expansion, resolve deployment account access and investigate live Supabase security advisor findings.

## Verified repository facts
- Default branch at inspection: `main`, commit `fb7091ef11b288492d43b50916f20cc844dc318a`.
- Web app lives in `apps/web`; its package manifest and npm lockfile are in that directory.
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase JS.
- Existing domain helpers query listings, cities/localities, profiles, saved listings/searches and related workflows.
- `apps/web/package.json` has `dev`, `build`, and `start` scripts only; no lint/type-check/test scripts were defined there.
- `.env.local.example` contains a Supabase URL and public anon key placeholder only. This does not prove environment configuration is correct.
- `apps/web/lib/supabase.ts` creates a browser Supabase client from `NEXT_PUBLIC_` variables. Do not put service-role/secret keys in public variables.
- The database schema snapshot has RLS policies and several SECURITY DEFINER functions. Function-level grants and policies must be reviewed together.

## Live Supabase advisor findings
The live project returned the following security advisories at the time of inspection. Advisor warnings are leads for investigation; they are not by themselves proof of exploitable vulnerabilities.

### High-priority review
1. **SECURITY DEFINER RPCs callable by anon/authenticated roles.** Advisor findings include `book_visit`, `get_booked_slots`, `increment_listing_views`, `is_admin`, `track_event`, and admin RPCs including `admin_funnel`, `admin_moderate_listing`, and `admin_resolve_report`. Some public calls may be intentional; inspect each function body, its arguments, data returned/modified, grants, rate limits, and auth checks before changing permissions. Admin RPCs must independently enforce admin authorization inside the function. Do not simply revoke all access or switch functions blindly, because this could break legitimate booking/analytics flows.
2. **RLS enabled but no policies:** `public.events` and `public.notification_outbox`. Determine whether clients should have any direct access. If these are internal-only tables, ensure grants are not exposed to anon/authenticated and keep writes behind trusted server-side code. Add policies only if there is a real client access case.
3. **Mutable function search_path:** `public.fmt_inr`. Review its implementation and pin a safe search_path or schema-qualify dependencies as appropriate.
4. **Leaked-password protection disabled:** enable Supabase Auth's compromised-password protection if compatible with the product's login UX.

### Performance advisor findings
- 13 foreign-key constraints without covering indexes.
- 23 RLS policy cases where auth/current-setting calls may be evaluated per row.
- These are optimization findings, not a reason to add indexes or rewrite every policy without checking query patterns and current policy semantics. Prioritize based on query plans and measured workload.

## Migration drift to reconcile
- The repository's `supabase/migrations` listing currently contains only three files (one empty baseline file and two later SQL migrations).
- The live Supabase project reports 20 migration history entries, including several dated October 2026 changes.
- This indicates the repository migration folder does not visibly represent the full live migration history. Verify whether migrations are stored elsewhere or were applied outside the repo before making schema changes. Reconcile safely and create a reliable migration baseline without replaying existing DDL into production.

## Vercel access
- The connected Vercel integration lists a project named `gonest-app`.
- Inspecting that project and listing its deployments return HTTP 403 for scope `jackfink9663-hues-projects`, while the queried project/team ID differs. Live build settings, deployment status, domains, logs and environment variable presence therefore remain unverified.
- Do not deploy or alter production settings until the intended Vercel account/team/project and commit are confirmed.

## Recommended sequence
1. Restore correct Vercel project/team access; verify GitHub repository, branch, root directory `apps/web`, environment-variable presence and latest production deployment.
2. Reconcile Supabase migrations with the live migration history.
3. Review all exposed SECURITY DEFINER RPCs and effective EXECUTE grants; test anon, buyer, owner, agent and admin behavior in a safe environment.
4. Inspect `events` and `notification_outbox` grants/RLS, plus `fmt_inr` search_path and leaked-password protection.
5. Add a small automated test suite for search, enquiry/viewing and authorization before expanding AI features.
6. Build AI search only after the structured search/data freshness workflow has reliable tests.

## Verification limits
- Repository files were inspected through GitHub APIs; a local build was not run because the execution environment could not resolve `github.com` to clone the repo.
- No secret-scanning result across full Git history was obtained.
- No role-context penetration tests were run.
- No production settings, schema, policies, grants or secrets were changed.
