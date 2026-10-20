# GoNest End-to-End Operating Model

**Status:** Execution blueprint, not a claim that every module is already implemented.

## North-star outcome

Build a trusted residential real-estate transaction platform, starting with Mumbai/MMR and Pune. Every public claim must be traceable to a source and freshness timestamp. Every customer action must create a durable record, have an accountable owner, and expose a clear next step.

## Non-negotiable principles

1. Trust before breadth: never fabricate listings, unit counts, prices, photos, RERA status, ownership or availability.
2. Separate entities: a property, project, phase, unit, listing, person, lead, visit and transaction are different records.
3. Record provenance: source, rights to use, submitter, observed-at time, verification state and expiry are first-class fields.
4. Human confirmation: an enquiry is not a booking; a visit request is not a confirmed appointment; an estimate is not a guaranteed valuation.
5. Security ships with each feature: least-privilege roles, RLS, audit logs, private documents, consent, abuse prevention and retention.
6. AI assists; deterministic code decides. AI may interpret search and summarize authorized records, but cannot invent inventory, legal status or transaction outcomes.
7. Release by gates: build, automated tests, permissions tests, role-based end-to-end tests and production smoke tests before promotion.

## Capability map

| Capability | Target workflow | Release gate |
|---|---|---|
| Search + map | Search/list/map, deterministic filters, saved searches, locality fallback when exact coordinates are absent | Results and map agree; no fabricated pins or privacy leaks |
| Listing management | Owner/agent draft → submit → review → publish → refresh/expire → pause/archive | Owner-scoped edits, media checks, duplicate detection, audit trail |
| Projects + units | Developer/project → phase/tower → unit → price sheet → dated availability → enquiry/visit → human confirmation | Only fresh, sourced and approved units show as available |
| Verified agents | Profile, MahaRERA evidence, brokerage, service area, reviews and active listing quality | Badge only while evidence is current and reviewed |
| Leads + visits | Enquiry → dedupe → assignment → response SLA → follow-up → requested visit → confirmed slot → outcome | Owner, status history, consent, notification retries and audit trail |
| AI price estimate | Comparables, range, confidence, explanation, date and exclusions | Local coverage, backtesting and error monitoring; never a guaranteed valuation |
| In-app messaging | Customer ↔ assigned agent/owner, attachments, read state, reports and notifications | Participant-only access, retention and abuse controls |
| Documents + e-sign | Private vault, versioning, access grants, approved signing provider and evidence | Provider and jurisdiction review, private storage and access logging |
| Enterprise asset tools | Portfolio, property, leases, maintenance, vendors, expenses, occupancy and reporting | Organization isolation, permissions and accounting controls |
| Cross-border | Country-specific currency, units, address, legal/tax disclosures, time zones and partner verification | Separate legal and operational review per country |
| Mobile | Responsive web first; PWA if useful; Flutter app after workflows/API contracts stabilize | Accessibility, analytics, crash reporting and release pipeline |
| AI assistant/copilots | Grounded search, listing drafts, lead summaries and ops assistance | Authorized data only, tool permissions, provenance, evaluations, budgets and human approval |

Competitor comparisons are strategic aspirations, not a verified statement that competitors lack or provide each feature.

## Core domain model

- Identity: profiles, roles, brokerages, developers, organization memberships and verification evidence.
- Inventory: property/building, project, phase/tower, unit, listing, media, amenities, price history and availability observations.
- Trust: source register, usage rights, verification events, freshness, moderation decisions, reports and audit log.
- Demand: saved search, enquiry/lead, conversation/message, visit request, confirmed visit, notification and follow-up activity.
- Transaction: offer, reservation, transaction, commission, documents, signing envelope and event history.
- Intelligence: comparable observations, estimate snapshots, model version and confidence/error metrics.
- Enterprise: portfolio, lease, tenant, maintenance ticket, vendor, invoice and asset performance.

A listing is not the property itself. A project reference is not unit inventory. A listing being visible does not prove it remains available.

## End-to-end workflows

### Owner / landlord
Sign up → verify contact → create draft → validate address and property details → add price and genuine media → confirm authority to advertise → submit → moderation and duplicate checks → publish → receive enquiry → respond → request/confirm visit → record outcome → refresh availability or pause/archive.

### Agent
Sign up → verify identity/contact → submit MahaRERA and brokerage evidence → operations review and expiry tracking → create/claim authorized listings → source checks and moderation → publish with explicit verification state → receive leads → respond within SLA → manage visits and follow-ups → periodic reverification.

### Builder / project inventory
Verify organization and representative → submit project, phase and official links → review registration references → add actual media and rights → import units and price sheet → record each unit status with source and observed-at timestamp → validate and approve → publish project and only current approved units → capture enquiry/visit → route to project team → confirm availability, price and visit → log outcome → expire stale observations until reconfirmed.

### Buyer / renter
Search by intent, city, locality, budget and configuration → filter/list/map → inspect source, freshness and verification → save/compare → enquire with consent → receive reference → agent/owner/project team receives request → respond and confirm visit → record outcome → follow up or close. Never describe a request as a confirmed appointment.

### Messaging and notifications
A lead or visit creates an activity → assign authorized recipient → enqueue notification → retry transient failures → record delivery state → restrict messages to participants → support report/block and abuse controls → preserve an auditable timeline.

### AI estimate and assistant
Gather authorized recent comparables → calculate a versioned baseline → report range, confidence, date, sample size and exclusions → allow corrections → backtest error by locality and property type. AI may explain the evidence but cannot fabricate comparables or claim a guaranteed valuation.

### Documents and transactions
Create transaction with explicit participants → store documents privately → grant scoped access → version and log access → use approved e-sign provider → verify signing status → store evidence and audit certificate → retain/delete under policy. Do not claim legal enforceability without provider and jurisdiction review.

## Prioritized execution plan

### P0 — Launch trust and transaction integrity
- Resolve security-advisor findings; review every exposed table, RLS policy, privileged function and grant.
- Keep demo/sample data out of public production discovery.
- Complete listing create/edit/publish/pause/archive permissions and media validation.
- Complete project/unit source, freshness and verification rules.
- Connect project enquiries and visits to the canonical leads/activity/notification workflow; avoid a separate inbox silo.
- Add deduplication, request limits, spam/report controls, consent and audit events.
- Add clean smoke tests for anonymous discovery, owner, agent, builder, admin and cross-account denial.
- Verify production domain, authentication, password reset/account deletion, storage permissions, logging and alerts.

**P0 release gate:** clean build; automated tests pass; RLS and role-isolation tests pass; buyer/owner/agent/builder/admin journeys pass in preview; production smoke test passes; real inventory source and response owner are in place.

### P1 — Marketplace operating system
Lead assignment, response SLAs, follow-up tasks, visit confirmation/cancellation, notification retries, agent licence expiry reminders, moderation queue, duplicate detection, stale listing expiry, saved-search alerts, project inventory import/export and operational analytics.

### P2 — Intelligence
AI natural-language search grounded in live records, listing copilot with human approval, comparable-based estimates after adequate data/backtesting, lead summaries, evaluation suite, model/version logs, budget limits and safe fallback.

### P3 — Transactions and enterprise
Secure messaging, private document vault, e-sign integration, transaction workspace, portfolio/lease/maintenance reporting, cross-border markets after country-specific compliance, and Flutter app after web flows and APIs stabilize.

## Operational dashboards

1. Supply quality: active inventory by city/locality/type, verified vs unverified, stale items, media completeness, duplicates, rights and last-confirmed time.
2. Demand funnel: search → detail → enquiry → contacted → visit requested → visit confirmed → completed → outcome.
3. Operations: unassigned leads, response SLA, overdue follow-ups, pending verification, reports, notification failures and incidents.
4. Project inventory: project/phase registration references, unit statuses, price-sheet date, last confirmation and source.
5. Trust/security: RLS test results, admin actions, denied access, suspicious activity, account deletion requests and incident log.
6. AI quality: estimate error by segment, confidence calibration, unsupported-answer rate, corrections and model cost.

## Release checklist

- [ ] Intended commit builds successfully.
- [ ] Migrations are reproducible and applied to the intended environment.
- [ ] No service-role secrets or private keys reach the browser.
- [ ] RLS, RPC grants and storage policies tested as anonymous, owner, agent, builder and admin.
- [ ] No sample inventory leaks into public production results.
- [ ] Search, map, details, media, filters and pagination are consistent.
- [ ] Enquiry, assignment, notification, visit confirmation/cancellation and follow-up persist and are observable.
- [ ] Empty, stale, unavailable and error states are explicit.
- [ ] Accessibility, mobile and performance smoke tests pass.
- [ ] Backups, logs, alerts, support ownership and rollback plan are ready.
- [ ] Operations has enough real, consented, source-linked inventory for the launch geography.

## Current baseline and immediate next actions

The latest database audit found 11 project records but zero unit-level inventory observations. The project directory may present sourced project references, but must not claim live available units yet. The project enquiry feature branch is open and unmerged; build, permissions and end-to-end verification remain release gates.

Execution order:
1. Review and resolve database security-advisor findings.
2. Complete and test project inventory/enquiry, integrating with existing leads, visits and notifications.
3. Collect and verify real owner, agent and builder inventory in Mumbai/MMR and Pune.
4. Run role-based end-to-end tests in preview.
5. Promote only the exact verified commit and smoke-test production.
6. Build CRM/notification reliability next, then AI features once local data coverage is adequate.

**Launch principle:** GoNest is launchable as a narrow, transparent marketplace only when real inventory and human response operations can reliably fulfil the website promise. A feature checklist is not evidence that the workflows work.
