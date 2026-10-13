# GoNest Architecture and Product Decisions

## D-001: Extend the existing application
**Status:** Accepted provisionally.  
**Decision:** Preserve the current Next.js/Supabase stack where sound rather than rewrite the platform.  
**Reason:** Existing marketplace pages, domain helpers and data tables provide a usable starting point.  
**Revisit if:** Build reliability, security, maintainability or product constraints make the stack unsuitable.

## D-002: Start with one rental journey
**Status:** Proposed.  
**Decision:** Prioritize trusted rental discovery, enquiry and viewing coordination in one geography.  
**Reason:** This is a narrow, measurable workflow that can test inventory quality and customer value.  
**Assumption:** Supply and renter acquisition are achievable in a focused area. Validate before scaling.

## D-003: Deterministic rules remain authoritative
**Status:** Accepted.  
**Decision:** Database/application code owns access control, price, status, availability and external actions. AI may parse, summarize and explain but cannot invent records or authorize actions.

## D-004: Modular monolith first
**Status:** Accepted.  
**Decision:** Keep clear domain boundaries in the current application and database; avoid microservices until a measured need exists.

## D-005: Deployment scope must be verified before release
**Status:** Blocked.  
**Decision:** Do not claim production readiness or deploy to production until the intended Vercel account/team, project, commit and environment are confirmed.  
**Current blocker:** Vercel API returns 403 for the connected integration scope.

## D-006: Schema changes require migration review
**Status:** Accepted.  
**Decision:** Inspect existing migrations and live schema, test changes outside production, review RLS/function grants, and verify after applying. Do not use a schema snapshot as a migration.
