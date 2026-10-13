# GoNest 90-Day Roadmap

This is a hypothesis-driven plan; dates and targets should be adjusted to team capacity and pilot evidence.

## Days 1–15: baseline and discovery
- **Owner:** Founder/Product + Engineering
- Inspect current flows, deployment, RLS, migrations, data quality, analytics and error handling.
- Interview 10–15 renters and 8–10 owners/agents; do not lead interviews with the proposed solution.
- Select one launch geography and define legal/commercial model.
- **Deliverables:** baseline audit, journey map, data acquisition plan, prioritized backlog.
- **Gate:** proceed only if the problem and accessible supply look credible.

## Days 16–30: close the reliability gaps
- **Owner:** Engineering + QA
- Stabilize search/detail/enquiry/viewing flow; define listing freshness; test authorization; add minimum tests and observability.
- Resolve Vercel account/project access and verify build settings.
- **Deliverables:** tested preview build, security findings list, onboarding checklist.
- **Gate:** no pilot with unresolved critical access-control or secret-exposure risks.

## Days 31–45: small supply cohort
- **Owner:** Marketplace Operations
- Onboard authorized listings manually; train owners/agents on availability updates; establish moderation and stale-listing queues.
- **Deliverables:** controlled pilot inventory and response process.
- **Gate:** assess freshness and operational cost before adding supply.

## Days 46–60: renter pilot
- **Owner:** Product + Operations
- Test discovery-to-enquiry-to-viewing. Track funnel, response times, completed viewings, complaints and repeat use.
- **Deliverables:** weekly funnel report and prioritized fixes.
- **Gate:** identify the biggest bottleneck from measured data.

## Days 61–75: narrow AI experiment
- **Owner:** Engineering + Product
- Prototype natural-language-to-structured-filters using real listing records; build regression set and safe fallback.
- **Deliverables:** evaluation results, latency/cost profile, clear limitations.
- **Gate:** keep AI only if it improves task completion or usability over conventional filters.

## Days 76–90: commercial test and decision
- **Owner:** Founder + Product + Finance/Operations
- Test a transparent pricing hypothesis with agents/landlords; calculate contribution margin and acquisition costs from actual activity.
- **Deliverables:** pilot review, next-quarter plan, continue/pivot/stop decision.
- **Gate:** expand only with evidence of customer value, trustworthy supply and a plausible acquisition channel.

## Metrics
Active authorized listings; share recently confirmed; search-to-enquiry; enquiry response time; viewing completion; fraud/duplicate reports; user satisfaction; repeat usage; agent activation; willingness to pay; retention; acquisition cost; contribution margin; AI cost per completed workflow. Set numeric targets after establishing a baseline.
