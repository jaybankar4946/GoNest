# GoNest Deployment Guide

## Repository layout
The Next.js app and its `package.json` / `package-lock.json` live under `apps/web`. The repository root does not contain the app package manifest. For a Vercel project targeting this app, verify **Root Directory = `apps/web`** and use the app's npm lockfile. Build command should use the existing `npm run build` script unless project settings intentionally override it.

## Environment variables
The committed `.env.local.example` documents:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are public client configuration values, not privileged secrets. Never add a Supabase service-role/secret key to a `NEXT_PUBLIC_` variable. Configure separate preview and production values in Vercel.

## Current verification limitation
The connected Vercel integration lists a project named `gonest-app`, but project inspection and deployment listing return 403 due to account/team scope mismatch. Thus the root directory, environment variables, latest deployment, domains and build logs have not been verified.

## Release checklist
1. Confirm correct Vercel account/team and repository link.
2. Confirm project points to `jaybankar4946/GoNest` and the intended branch.
3. Confirm root directory and build settings.
4. Verify required env vars exist in preview and production without printing their values.
5. Deploy a preview and test core journeys.
6. Run automated quality/security checks before production promotion.
7. Verify deployed commit, status, domains and logs after release.
8. Document rollback procedure and monitor errors after launch.
