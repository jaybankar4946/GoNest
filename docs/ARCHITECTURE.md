# GoNest Architecture

## Current implementation (repository inspection)
- Web application: Next.js 16, React 19, TypeScript in `apps/web`.
- Styling: Tailwind CSS 4.
- Data/auth client: `@supabase/supabase-js`, currently initialized in `apps/web/lib/supabase.ts` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Domain helpers: `apps/web/lib/api.ts` queries listings, cities/localities, profiles and marketplace workflows.
- Database schema snapshot: `supabase/remote_schema.sql`; migrations also exist under `supabase/migrations`. Confirm migration history before changing production schema.
- Deployment: Vercel is intended, but connected project access currently fails with 403; project settings/build status are not verified.

## Target architecture
Keep a modular monolith. Domain modules: catalog/listings, search, identity/access, enquiries, viewings, verification/moderation, notifications, and AI assistance. Use PostgreSQL/Supabase as source of truth; use deterministic SQL/RPC/application rules for permissions, prices, statuses and availability.

## Request boundaries
- Browser: UI, public search, user-initiated actions, publishable Supabase key only.
- Database/RLS: final row-level authorization and tenant/owner boundaries.
- Server-side services / Edge Functions: privileged operations, external APIs, rate-limited workflows, AI provider calls, signed file access, and secrets.
- AI adapter: provider-independent interface; accepts only minimum required context and returns validated structured output.
- Background jobs: introduce only when reminders, revalidation or retries need reliable asynchronous execution.

## Data flow
UI -> typed domain service -> Supabase query/RPC with RLS -> validated result -> UI. For privileged or external actions, route through a server-side boundary with authentication, authorization, validation, idempotency and audit logging.

## Architecture decisions
- Do not introduce microservices for the MVP.
- PostgreSQL search first; evaluate PostGIS/dedicated search only against measured needs.
- Keep provider credentials server-side; never use `NEXT_PUBLIC_` for secrets.
- Keep AI output separate from source-of-truth property facts.
- Prefer additive migrations and backward-compatible deployments.
