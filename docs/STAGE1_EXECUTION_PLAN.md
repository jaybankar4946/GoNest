# GoNest Stage 1 — Product Reliability to Product-Market Fit

**Operating objective:** Prove that GoNest helps a real buyer or renter find a genuine residential property and complete a useful connection with its owner or authorised agent. Do not scale geography, headcount or feature scope until the core loop works repeatedly.

**Market focus:** Mumbai/MMR and Pune. **Review date:** 4 November 2026.

## 1. Stage definition

- **Stage 1 — Product and PMF evidence:** reliable core journeys, genuine supply, real demand, successful matches, repeat usage and early commercial validation.
- **Stage 2 — Growth and scale:** repeatable acquisition, city expansion, hiring, capital and unit economics.
- **Stage 3 — Organisation:** leadership, functional ownership, governance and operating systems.

Completing software tasks is not equivalent to proving product-market fit. Stage 1 exits only on sustained customer evidence.

## 2. Baseline audit — live Supabase database

Counts below were queried from the connected Supabase project on 2026-11-04. “Real” means only `is_sample = false`; it does **not** prove ownership, authority, availability or accuracy.

| Metric | Current database count | Interpretation |
|---|---:|---|
| All listing rows | 75 | Includes 72 archived sample rows |
| Active non-sample listings | 3 | All three are in Mumbai |
| Active non-sample sale listings | 1 | 1 verified |
| Active non-sample rental listings | 2 | 0 verified |
| Verified active non-sample listings | 1 | Needs evidence/recency check |
| Non-sample agent profiles marked GoNest-verified | 0 | No verified agent supply |
| Non-sample builder profiles marked verified | 0 | No verified builder supply |
| Non-sample residential projects | 25 | 9 marked verified; project verification does not verify unit availability |
| Pending non-sample projects | 16 | Review queue |
| Leads | 6 | All currently status `new`; not evidence of successful contact |
| Visit requests | 3 | All currently status `requested`; none confirmed or completed |
| Business enquiries | 1 | Needs follow-up and outcome tracking |
| Saved listings | 1 | One user has saved a listing |
| Saved searches | 0 | No saved search records |
| Distinct users with tracked events | 8 | Instrumentation coverage is limited |
| Tracked events (all-time non-sample) | 990 searches, 47 property views, 2 lead-submitted events, 1 visit-requested event | Event counts are not unique customers or successful outcomes |

The three active non-sample listings are in Mumbai (1 sale, 2 rent); no active non-sample listing appeared in Pune in the city-level inventory query. This makes genuine Pune supply a priority.

Historical company metrics previously shared by the founder — 18,000+ registrations, 6,500+ MAU, 42,000+ listings and 120,000+ annual enquiries — remain historical claims until reconciled to dated source exports, deduplicated users, current active supply and genuine enquiry outcomes. Do not blend those figures with the current database snapshot.

## 3. Stage 1 exit gates — eight independent proofs

| Gate | Evidence required | Current status |
|---|---|---|
| 1. Buy, Rent and New Projects journeys | Production test script passes on desktop/mobile; accurate empty/error states; search/filter/detail navigation | Not independently tested end to end |
| 2. Genuine, current inventory | Owner/agent authority, source, photos, price, availability and last-verified date recorded for each public listing | Major gap: 3 active non-sample listings; 1 verified |
| 3. Agent/listing relationships | Identity/RERA evidence reviewed; agent claims/controls their profile; listing relationship explicit | Major gap: 0 verified non-sample agents |
| 4. Enquiry and visit workflow | Form writes to database; correct owner/agent inbox; status changes; confirmation and notification; privacy checks | Partially built; needs live test and operational follow-through |
| 5. Completed customer searches and visits | Qualified users, response times, visits confirmed/completed, outcome captured | Not established: 3 requests, 0 confirmed, 0 completed |
| 6. Returning behaviour | Cohort retention, repeat search, saved homes/searches, returning users by week | Not established; baseline instrumentation is small |
| 7. Repeatable acquisition | Channel-level qualified leads and cost/time per qualified customer; repeatable supplier onboarding | Not established |
| 8. Commercial validation | Paid customers or repeatable willingness-to-pay, revenue collection and contribution economics | Not established |

Do not show a percentage complete until each gate has an evidence link, date and named reviewer. A UI checkbox is not external verification.

## 4. Execution phases

### Phase A — Product reliability (first 3–5 working days)

1. Run a scripted production QA pass for Buy, Rent, Projects, property detail, agent profile, sign-in, owner/agent/builder onboarding, listing submission, saved listing, lead submission, visit request, admin moderation and mobile responsiveness.
2. Fix P0/P1 defects only. Defer new AI features, decorative redesign and non-core dashboards.
3. Verify RLS and grants for every public write path; review Supabase security advisor findings before schema/policy changes.
4. Confirm each enquiry is recorded once, visible only to authorised parties and has an operational follow-up owner.
5. Keep visit booking on the property detail journey; agent directory cards should focus on contacting the professional, not competing booking actions.
6. Confirm notification delivery, retry/failure visibility and no false “sent/confirmed” success messages.

**Exit evidence:** QA checklist, screenshots/test records, error scan, permission checks, successful test enquiry and test visit with admin/owner follow-up.

### Phase B — Genuine marketplace supply (next 5–10 working days; runs in parallel)

Initial targets (targets, not existing achievements):

| Supply metric | Target |
|---|---:|
| Verified builders/developers | 10 |
| Verified agents/agencies | 20 |
| Genuine sale listings | 35 |
| Genuine rental listings | 28 |

Start with Mumbai/MMR and Pune. Prioritise supply density in a few neighbourhoods over thin national coverage. Each listing must include:
- real owner or authorised-agent relationship and contact verification;
- genuine property photos, accurate address/locality, BHK, carpet/built-up area where known;
- sale/rent price, deposit/brokerage where relevant, possession/availability status;
- source/evidence, verification status and last-confirmed date;
- clear status if details are unverified, stale, unavailable or under review.

Never fill targets with synthetic inventory or scraped records presented as authorised listings. Public business directory entries remain clearly labelled as public/unclaimed until the business claims and passes review.

### Phase C — Customer acquisition and successful connections (first 2–4 weeks after Phase A starts)

1. Recruit a small cohort of real buyers/renters in the exact neighbourhoods where supply is verified.
2. Interview at least 10 buyers/renters and 10 owners/agents; record their current alternatives, pain, budget, urgency and objections.
3. Track qualified search → property view → save/contact → owner response → visit requested → visit confirmed → visit completed → outcome.
4. Set service expectations: human follow-up to every qualified enquiry, response-time target, and explicit reason when no match exists.
5. Targets for the first operating cohort: 50 qualified enquiries and 20 completed visits. These are activity targets, not PMF proof.
6. Capture the final outcome: rented, purchased, no-show, unsuitable, unavailable, duplicate, or still active.

### Phase D — PMF evidence (review weekly; expect sustained observation, not a one-day launch)

1. Measure weekly cohorts of activated buyers/renters, repeat searchers, saved-property users and enquiry-to-visit conversion.
2. Measure supply-side retention: owners/agents responding, refreshing availability and submitting more genuine inventory.
3. Calculate channel conversion, cost per qualified enquiry, response time, visit completion and successful-match rate.
4. Test willingness to pay with a narrow, transparent offer (e.g. qualified leads or a builder/agent subscription) before building a complex monetisation stack.
5. Review whether customers recommend GoNest or return without being prompted.
6. Declare PMF only when a narrow segment repeatedly obtains value, retention is improving and acquisition/supply economics plausibly support growth over multiple cohorts.

## 5. Weekly founder dashboard

Review these every Monday:
- active, verified, fresh sale/rental inventory by city and locality;
- new supplier profiles, verification pass rate and time-to-publish;
- unique qualified buyers/renters, searches and property views;
- contact conversion, owner response rate and median response time;
- visits requested, confirmed, completed and no-show;
- successful rentals/sales and time-to-match;
- 7/30-day returning users and saved listings/searches;
- revenue, paid conversion, refund/complaint rate and acquisition cost;
- open P0/P1 defects, failed notifications and data/security exceptions.

Use unique people and cohorts, not raw event counts alone. Exclude sample/demo data from all operating metrics.

## 6. Stop doing for now

- No expansion to every Indian city.
- No large executive hiring or fundraising purely because the product is feature-rich.
- No endless AI additions or dashboards without a measurable customer problem.
- No synthetic listings, fake profiles, invented photographs or inflated verification claims.
- No marking enquiries as successful simply because a database row was created.

## 7. Current founder decision

**GoNest is not yet ready to declare Stage 1 complete or product-market fit.** The product foundation is substantial, but current connected-database evidence shows only 3 active non-sample listings, 1 verified active listing, 0 verified non-sample agents, 0 completed visits and no demonstrated repeat-use or commercial proof.

The immediate mission is to turn those three active listings into a genuinely verified, responsive Mumbai–Pune marketplace, test the full customer loop, and build evidence every week. Move to Stage 2 only after Stage 1 gates have sustained proof.

## 8. Decision log

- 2026-11-04: Baseline snapshot queried from Supabase; values recorded in Section 2.
- 2026-11-04: Existing production deployment checked as READY; deployment readiness is not equivalent to product readiness.
- 2026-11-04: Agent directory agency contact path identified for persisted enquiry capture; follow-up inbox is part of Phase A and must be verified in production before marking complete.
