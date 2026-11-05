# GoNest — YC and investor evidence brief

Prepared: 5 November 2026. Re-run all database figures before external use.

## One-line description

GoNest is an India-first residential property marketplace helping buyers and renters discover homes and connect with owners and property professionals, with clearer verification, availability and decision-making information.

## Problem hypothesis

Residential discovery is fragmented. Buyers and renters struggle to judge whether listings are genuine, current and affordable; owners and agents struggle to reach qualified demand; project availability can be difficult to verify at unit level. Validate these claims through interviews and observed outcomes before quantifying them.

## Product today

The repository contains journeys for Buy/Rent search, property details, owner/agent listing submissions, agent directory, builder/project onboarding, admin moderation, enquiries, visits, saved listings/searches and cost/EMI decision tools. Code and routes existing does not prove that every workflow passes end-to-end.

## Production evidence snapshot (database audit, 5 Nov 2026)

- 11 Auth users and 11 profile rows.
- 3 active non-sample listings; all were posted by the admin profile. One marked verified and two unverified.
- 72 sample/archived listings are not genuine active supply.
- 27 non-sample project records, 10 marked verified at project-record level; this does not mean live unit inventory is verified.
- 0 project inventory observations and 0 unit review events.
- 1 non-sample agent profile with a RERA number and verified flag; no non-sample owner profile.
- 2 non-sample leads and 1 non-sample visit record.
- 95 pending notification outbox rows with zero attempts at audit time.
- 30-day telemetry is raw activity and is not validated MAU or customer activity.

These are database observations, not traction claims.

## Historical metrics requiring reconciliation

Previously cited historical GoNest figures include 18K+ registered users, 6.5K+ MAU, 42K+ listings and 120K+ annual property enquiries. The current production database snapshot does not corroborate them.

Before using these externally:
1. Identify the legacy analytics/database source.
2. Define metric and time window.
3. Remove bots, duplicates, test users and sample records.
4. Reconcile unique users, monthly active users, unique listings and unique enquiries.
5. Retain query exports as evidence.
6. Label figures historical if not current.

Never combine historical metrics with current production counts.

## What must be proven next

1. Supply activation: genuine owners, agents and builders publish current inventory.
2. Demand activation: real buyers/renters search and submit qualified enquiries.
3. Liquidity: suppliers respond and enquiries convert into conversations, visits and outcomes.
4. Trust: evidence-backed checks reduce stale, duplicate and misleading listings.
5. Retention: users and suppliers return.
6. Economics: acquisition/onboarding costs, revenue per successful outcome and repeat usage.

## YC progress update template

- Product shipped: [workflows tested by real users].
- Supply: [real active listings], [verified agents], [projects with unit evidence].
- Demand: [qualified buyers], [qualified renters], [unique enquiries].
- Liquidity: [supplier response rate], [median response time], [visits completed].
- Learning: [observed user behaviour] and [product change made].
- Next 30 days: [one measurable supply goal] and [one measurable demand/fulfilment goal].

## Investor data-room checklist

- [ ] Current product demo with QA data clearly separated from real inventory.
- [ ] Architecture and release process.
- [ ] Security review, RLS tests, privacy policy, terms and data retention.
- [ ] Redacted supplier/listing evidence.
- [ ] Funnel dashboard with metric definitions and sample exclusion.
- [ ] Cohort retention and repeat-use analysis.
- [ ] Enquiry response and conversion reports.
- [ ] Revenue, expenses, runway and cap table.
- [ ] Founder roles, ownership and commitment.
- [ ] Sourced competitor map and market sizing.
- [ ] Fundraising amount, use of funds and milestones.

## Honest positioning

Do not claim product-market fit, nationwide verified coverage, 18K current users, 120K current enquiries, active builder partnerships, live unit inventory, revenue scale or investor interest without current evidence. The strongest early story is the trust problem, focused Mumbai/MMR–Pune wedge, verification workflow and measurable learning from a real pilot.
