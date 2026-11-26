# GoNest

GoNest is a residential real-estate marketplace built with Next.js, React, TypeScript and Supabase. The product supports property discovery and listing workflows for buyers, renters, owners, agents and builders.

## Repository structure

```text
apps/
  web/                 Next.js application
    app/               App Router pages and route handlers
    components/        UI and workflow components
    lib/               Supabase client, API helpers and shared types
supabase/
  migrations/          Database schema and policy migrations
  remote_schema.sql    Schema snapshot (not a substitute for migrations)
docs/                  Product and operating-model documentation
```

## Requirements

- Node.js 22 (Node.js 20.9+ is required by the current Next.js version)
- npm
- Supabase project credentials for running the application against a real backend

## Local development

Run commands from the web application directory:

```bash
cd apps/web
npm install
cp .env.local.example .env.local
```

Set the Supabase URL and publishable/anon key in `.env.local`. Never put a Supabase service-role key or secret key in a `NEXT_PUBLIC_*` variable or browser code.

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

## Quality checks

From `apps/web`:

```bash
npm run typecheck
npm run build
```

The `typecheck` script runs the TypeScript compiler without emitting files. The build requires valid application configuration and may need working Supabase environment variables for pages that fetch data during prerendering.

A GitHub Actions workflow runs the typecheck on pushes and pull requests. The repository currently has no committed npm lockfile; add and review one before relying on deterministic dependency installation or production release gates.

## Environment variables

See [apps/web/.env.local.example](apps/web/.env.local.example) for the supported variables. Configure production values in the hosting provider's environment settings. Do not commit local environment files, credentials, private documents or production data.

## Database and security

- Apply reviewed SQL migrations to the intended Supabase environment.
- Keep Row Level Security enabled on exposed tables and verify policies with separate anonymous and authenticated test accounts.
- Treat `service_role` credentials as server-only secrets.
- Verify storage policies, RPC execute grants, admin authorization and cross-account isolation before release.
- Never represent demo/sample inventory as genuine available property.

See [docs/GO_NEST_OPERATING_MODEL.md](docs/GO_NEST_OPERATING_MODEL.md) for product workflows, data provenance requirements and release gates.

## Deployment

The application is hosted on Vercel. Confirm the Vercel project's Root Directory is `apps/web`, and verify the intended production branch and environment variables in project settings. Pull requests should be validated on preview deployments before promotion to production.

Do not deploy a branch merely because its Vercel build is marked READY: confirm the commit, environment, domain aliases and end-to-end workflows first.

## Product principle

GoNest prioritizes genuine inventory, transparent verification status, reliable enquiries and confirmed visits. A submitted enquiry is not a confirmed visit, and a project record is not proof of currently available units.
