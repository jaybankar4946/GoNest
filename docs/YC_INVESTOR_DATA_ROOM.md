# GoNest — YC and investor evidence brief

Prepared: 5 November 2026  
Purpose: working source of truth for founder updates, applications and investor diligence.

## One-line description

GoNest is an India-first residential property marketplace helping buyers and renters discover homes and connect with owners and property professionals, with a focus on clearer verification, availability and decision-making information.

## Problem hypothesis

Residential property discovery is fragmented. Buyers and renters struggle to judge whether a listing is genuine, current and affordable; owners and agents struggle to reach qualified demand; project inventory and availability can be difficult to verify at unit level.

These are hypotheses to validate with interviews and observed marketplace outcomes. Do not present them as quantified market research until sourced.

## Product today

The repository contains the core journeys for:
- Buy and Rent search, filters, listing cards and property details.
- Owner and agent listing submission and dashboards.
- Agent directory and public business profiles.
- Developer onboarding, project submissions and project detail pages.
- Admin moderation, verification and audit workflows.
- Buyer enquiries, visit requests, saved listings and saved searches.
- EMI, rental-cost and property-comparison decision tools.

A route or code path existing does not prove the complete workflow is reliable. State the difference clearly in diligence.

## Current evidence snapshot

Database audit on 5 November 2026:

- 11 Auth users and 11 profile rows.
- 3 active non-sample listings, all created by the admin profile; 1 marked verified and 2 unverified.
- 72 sample/archived listings are not genuine active supply.
- 27 non-sample project records, 10 marked verified at project-record level; this does not mean live unit inventory is verified.
- 0 project inventory observations and 0 unit review events.
- 1 non-sample agent profile with a RERA number and verified flag; no non-sample owner profile.
- 2 non-sample leads and 1 non-sample visit record at the time of audit.
- 95 pending notification outbox rows with zero attempts at the time of audit.
- 30-day event data contains raw telemetry and is not validated MAU or customer activity.

These are database observations, not a claim of traction. Re-run the queries before sharing externally.

## Historical metrics requiring reconciliation

The founder has previously cited historical GoNest figures including 18K+ registered users, 6.5K+ MAU, 42K+ listings and 120K+ annual property enquiries. The current production database snapshot does not corroborate those figures.

Before using them in a YC application or investor deck:
1. Identify the legacy database/analytics source.
2. Define each metric precisely and the date range.
3. Remove bots, duplicates, test accounts and sample records.
4. Reconcile users, monthly active users, unique listings and unique enquiries.
5. Retain query exports and screenshots as evidence.
6. Label them historical if they are not current.

Do not mix historical GoNest metrics with the current production marketplace snapshot.

## What we need to prove next

1. **Supply activation:** genuine owners, agents and builders complete onboarding and publish verified, current inventory.
2. **Demand activation:** real buyers and renters search in target localities and submit qualified enquiries.
3. **Liquidity:** suppliers respond quickly and enquiries convert into conversations, visits and successful outcomes.
4. **Trust:** evidence-backed verification reduces stale, duplicate, misleading and unavailable listings.
5. **Retention:** users return for additional searches, visits or transactions; suppliers keep inventory current.
6. **Economics:** measure acquisition cost, supplier onboarding cost, revenue per successful outcome and repeat usage before claiming a scalable model.

## Suggested YC progress update structure

Use only verified numbers in the blanks:

- Product shipped: [specific workflows tested by real users].
- Supply: [real active listings], [verified agents], [verified projects with unit evidence].
- Demand: [qualified buyers], [qualified renters], [unique enquiries].
- Liquidity: [supplier response rate], [median response time], [visits completed].
- Learning: [one specific behaviour observed] and [what changed as a result].
- Next 30 days: [one measurable supply goal] and [one measurable demand/fulfilment goal].

## Investor data-room checklist

- [ ] Current product demo with seeded QA account clearly separated from real data.
- [ ] Live architecture diagram and deployment/release process.
- [ ] Security review, RLS tests, privacy policy, terms and data retention policy.
- [ ] Verified supplier and listing evidence samples, with personal data redacted.
- [ ] Funnel dashboard with metric definitions and sample exclusion.
- [ ] Cohort retention and repeat-use analysis.
- [ ] Enquiry response and conversion reports.
- [ ] Revenue, expenses, runway and cap table.
- [ ] Founder roles, ownership, commitment and relocation plan.
- [ ] Competitor map and sourced market sizing.
- [ ] Clear fundraising amount, use of funds and milestones.

## Honest positioning

Do not claim product-market fit, a verified nationwide network, 18K current registered users, 120K current enquiries, active builder partnerships, live unit inventory, revenue scale or investor interest unless supported by current evidence. The strongest early story is the specific trust problem, the focused Mumbai/MMR–Pune wedge, the product's verification workflow and the measurable learning from a real pilot.
