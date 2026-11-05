# GoNest Known Limitations

## Verified from repository inspection
- App code is under `apps/web`; app manifest and npm lockfile are in that directory.
- Existing marketplace schema and code cover listings, cities/localities, profiles, saved items/searches, leads, visits and verification/moderation concepts.
- `apps/web/package.json` currently has only `dev`, `build`, and `start` scripts.
- The frontend uses Supabase's public client key; database policy correctness still requires role-based tests.
- A client-side admin redirect exists in UI code and must not be treated as an authorization boundary.

## Not yet verified
- Clean local install, production build, type check, lint, unit/integration/E2E test results.
- Full RLS correctness for all tables and storage buckets.
- Security-definer function grants and all effective execute permissions.
- Secret scanning across all Git history.
- Vercel project root directory, environment values, domains, current deployment and build logs due to 403 integration scope.
- Market demand, acquisition economics, pricing and customer retention.

## Product limitations to resolve
- Listing freshness and evidence must be made visible and operationally enforced.
- “Verified” terminology needs exact definitions.
- No AI capability should be presented as live until implemented and evaluated.
- Legal and regulatory applicability requires a geography-specific review.
