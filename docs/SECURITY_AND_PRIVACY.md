# GoNest Security and Privacy

## Current notes
- The frontend Supabase client uses a public URL and anon key, which are intended for browser use when RLS is correctly configured.
- The inspected public tables had RLS enabled, but that alone does not prove every policy is correct.
- Admin page redirects in client code are UX only; database policies and server-side checks must enforce privileges.
- Do not commit secrets or print environment values during diagnostics.

## Required controls
- Least-privilege RLS policies for each table and operation.
- Test anonymous, authenticated buyer, owner, agent and admin access separately.
- Prevent self-escalation of role or verification status.
- Ensure privileged functions explicitly check identity/role and have minimal grants.
- Review SECURITY DEFINER functions, fixed search_path, EXECUTE grants and audit coverage.
- Keep service-role/secret keys server-side only; any `NEXT_PUBLIC_` value is public.
- Validate and rate-limit enquiry, contact, upload and AI endpoints.
- Secure file upload types/size, private buckets, signed access, and malware scanning where available.
- Add abuse controls, safe errors, audit events, backups, deletion/export processes, and incident response.
- Minimize sensitive personal data and define retention periods.

## AI-specific controls
Treat retrieved text and uploaded documents as untrusted input. Restrict tool access, validate structured output, redact unnecessary personal data, cap model spend, and require human confirmation for consequential actions.

## Pre-pilot security gate
Run database advisors where available, test RLS with real role contexts, review storage policies and RPC grants, run dependency/security checks, verify no secrets in tracked files/history, and record unresolved risks. This document is not a completed security certification.
