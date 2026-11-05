# GoNest Testing Strategy

## Current gap
The inspected `apps/web/package.json` defines `dev`, `build`, and `start`; no lint, type-check, unit-test, integration-test, or E2E scripts were present in that file. Add them in deliberate steps after selecting compatible tooling.

## Test layers
- Unit: query/filter normalization, currency/price boundaries, status transitions, permission helpers, AI schema validation.
- Integration: Supabase reads/writes under realistic role contexts, listing creation/update, enquiry, saved listing, viewing request, storage policies and RPC grants.
- E2E: renter search/save/enquiry; owner creates/updates listing; agent handles lead; viewing request; admin moderation; unauthorized private-data access; stale listing; AI missing/contradictory facts.
- AI evaluation: constraint extraction, clarifying questions, grounding, prompt injection, fairness, tool denial, latency and cost.

## Quality gates
- Install from committed lockfile with a clean environment.
- Run type check, lint, unit/integration tests, production build and dependency audit.
- Use non-production Supabase data for tests.
- Ensure tests cannot silently weaken RLS or disable security controls.
- Record exact commands, versions and results in PRs.
