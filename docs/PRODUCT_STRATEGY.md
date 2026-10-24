# GoNest Product Strategy

## Vision
Help people find and act on trustworthy residential property information, while giving owners and authorized agents a simpler way to manage listings, enquiries, and viewings. The long-term vision is an AI-enabled residential real-estate operating system; the near-term objective is a reliable marketplace workflow.

## Current-state observations
- The repository contains a Next.js 16 / React 19 / TypeScript web app under `apps/web`.
- Supabase is already used for listings, cities/localities, profiles, saved listings/searches, leads, visits, and related operations.
- The schema supports both rent and sale. This is an existing capability, not proof of market demand.
- Vercel project access currently returns 403 for the connected integration, so live deployment configuration and status are unverified.

## Initial wedge hypothesis
**Trusted rental discovery + enquiry + viewing coordination** in one launch geography. Rental journeys are frequent and can be tested with a small supply cohort. Do not call this validated until customer interviews and a pilot support it.

## Strategic options
| Wedge | Strength | Main risk | Current view |
|---|---|---|---|
| Rental marketplace | Frequent consumer need; clear search-to-viewing journey | Inventory freshness and two-sided acquisition | Best first hypothesis |
| Buy/sell marketplace | Higher-value transactions | Longer cycles and more complex trust requirements | Later |
| Agent/landlord operating system | Recurring B2B revenue potential | Sales cycle and workflow adoption | Test as a supporting product |
| Rental marketplace + lightweight CRM | Connects consumer demand with supply operations | Scope can expand too quickly | Target after core rental journey works |

## Initial customer hypotheses
- Renters who need to compare suitable homes and arrange viewings.
- Owners and authorized agents who need qualified enquiries and fewer stale/duplicate listings.
- Small broker teams that need a simple lead and viewing workflow.

## Differentiation
1. Explain what was checked and when; avoid vague “verified” badges.
2. Make listing freshness visible and re-confirm availability.
3. Turn discovery into an accountable enquiry/viewing workflow.
4. Use AI for structured search and summarization only when grounded in stored listing facts.
5. Give owners/agents useful operations tools without making the consumer experience feel like a CRM.

## Validation before expansion
Conduct 10–15 renter interviews and 8–10 owner/agent interviews; manually onboard a small authorized inventory cohort; measure freshness, enquiry response, completed viewings, repeat usage, and willingness to pay. These are research targets, not claims of completed research.

## Excluded from first release
Payments, legal-title verification claims, automatic offer negotiation, signing agreements, nationwide coverage, advanced property management, paid ranking, multi-agent orchestration, and expensive standalone search infrastructure.
