# GoNest Mumbai + Pune marketplace inventory and cost transparency

## Release scope
Keep the selected production baseline untouched. This work is prepared on `feature/mumbai-pune-marketplace-cost-transparency` for preview review. Never label illustrative or third-party information as live, verified GoNest inventory.

## Required discovery collections
Build separate, filterable collections for each city:
- Top 10 developers / new-project teams
- Top 10 agents / broker teams
- Top 10 flats for sale (owner and resale)
- Top 10 rental homes

City scope: Mumbai Metropolitan Region (Mumbai, Thane, Navi Mumbai and clearly identified suburbs) and Pune. The location must be explicit on every card. Do not combine Mumbai proper, MMR and Pune into a misleading city ranking.

## Ranking policy
“Top” must be an explainable, dated ranking—not manually invented editorial authority. Use a separate ranking for each city and category. Suggested weighted score after sufficient data exists:
- 30% verified identity / authority to advertise and relevant RERA checks
- 25% completeness and recency of listing/project data
- 20% independently supported inventory/availability and photo authenticity
- 15% responsiveness and completed enquiry/visit outcomes
- 10% user feedback and report/fraud history
Never rank by payment alone. Sponsored placements must be clearly labelled “Sponsored” and must not be called “Top” or “Verified” because they paid. Show “Ranked using GoNest data as of [date]”; if the minimum evidence threshold is not met, show “Featured picks” or “New on GoNest”, not a top-10 claim.

## Data admission rules
- Every live property needs a unique canonical property/listing record, source/provenance, listing authority, contact owner, last-confirmed date, status, genuine media and moderation outcome.
- Projects and units are separate. New-project cards should identify developer, exact project/location, MahaRERA registration (when applicable), possession timeline as sourced, configuration, carpet area, base price and exclusions.
- Agents: identity, agency, contact verification, MahaRERA registration/details where applicable, specialisation, service areas, active authorised listings and last verified date.
- Never scrape/re-publish another portal's copyrighted photos or private contact data. Use licensed feeds, developer-authorised material, public sources only where reuse is permitted, and owner/agent-submitted content with moderation.
- Expired, sold, rented, duplicate, sample or unconfirmed listings must not enter public “Top 10” or live search. Current production database was last checked with 0 active/published listings and 57 sample listings; this must be rechecked before launch.

## Detailed listing requirements

### Shared
Title, sale/rent/project type, price, city/locality, map pin with privacy controls, carpet area and measurement basis, BHK/bathrooms/balconies, floor/total floors, building age, furnishing, facing if supplied, amenities, parking, genuine photo gallery, video/virtual tour if available, possession/availability date, maintenance, restrictions, accessibility, nearby transit only when sourced, source and last-updated timestamp, verification level and what was actually checked, listing ID, contact role, enquiry and visit scheduling, save/share/report, similar homes, FAQs and document checklist.

### Sale / resale
Ask price and price per carpet sq ft; negotiation status; society maintenance and unpaid-dues confirmation; property tax and utility dues; parking ownership/charges; OC/CC and approved-plan status where applicable; conveyance/title-chain/encumbrance/loan status (document status, not a legal guarantee); seller authority; MahaRERA details where applicable; possession; loan/EMI calculator; buyer's estimated acquisition-cost breakdown.

### Rent
Monthly rent, refundable deposit and refund conditions, lock-in, notice period, term, escalation, move-in date, furnishing/inventory, maintenance included or extra, electricity/water/gas, parking, pet/occupancy rules, society NOC/process, agreement and police verification responsibilities where applicable, brokerage payer and exact amount/formula, one-time charges, rent receipt and deposit-return terms. Never assume a universal society NOC fee or universal brokerage.

### New projects / developers
Developer legal name, project name and address, MahaRERA number/link/status where applicable, source and check date, configurations, carpet area, base price range and exclusions, floor-rise/parking/clubhouse/maintenance/corpus/infra charges if officially disclosed, GST treatment subject to project and buyer eligibility, stamp duty/registration estimates, possession/phase, construction status, amenities with source, plans/brochure only with permission, sample-flat/visit request, booking amount and cancellation terms as disclosed.

### Agent listings
Agent profile and agency, contact verification, MahaRERA number/status where applicable, authorisation to market each property, relationship to owner, exact brokerage terms and payer, supported areas/specialisations, response-time data only when measured, review provenance, active listing count from GoNest records and last-verified date.

## Customer cost transparency

### Rental move-in estimator
Show first month rent; refundable deposit separately from fees; brokerage only from the stated terms; Maharashtra leave-and-license stamp duty estimate; registration fee estimate; legal drafting; society NOC/move-in amount only when quoted; movers, utility deposits and maintenance if known. Make inputs editable. Explain assumptions and show a range if unknown. Agreement duty depends on term, rent, deposit treatment and instrument wording; confirm with IGR Maharashtra / Sub-Registrar. Do not represent an estimated society charge as a statutory fee.

### Purchase estimator
Show sale consideration separately from acquisition costs: state/local stamp duty, registration fee subject to applicable cap/rules, legal/title review, loan processing/valuation, society transfer/dues if applicable, parking, corpus/maintenance, interiors/moving, taxes/utility deposits and applicable GST for eligible under-construction purchases. Distinguish buyer category and exact municipal jurisdiction. Stamp duty may be based on the higher of agreement consideration and applicable Ready Reckoner value. Never calculate a final legal demand from city name alone; ask for jurisdiction, buyer eligibility and transaction/project details, cite the official current calculator/rule, and label the estimate date. Do not infer a GST rate from price alone; affordable-housing eligibility has additional criteria.

Every estimate must display:
- “Indicative estimate — not a quote or legal/tax advice”
- calculation inputs, formula/rate source and “checked on” date
- known vs user-entered vs unknown line items
- a clear reminder to verify with IGR Maharashtra / Sub-Registrar, society, lender, developer and qualified lawyer before paying.

## End-to-end journeys to acceptance-test
1. Owner: signup/contact verification → owner role → draft → detailed fields and real photos → authority declaration → preview cost disclosure → submit → duplicate/document moderation → approve/reject with reason → publish → enquiry delivery → response → visit request/confirmation → outcome/follow-up → refresh/mark unavailable/archive.
2. Agent: signup → identity/contact and RERA review where applicable → brokerage disclosure → owner authorisation per listing → submit → moderation → leads and visit management → response tracking → expiry/verification reminders.
3. Builder: organisation/profile → project and source/RERA checks → phases/configurations/units → price and exclusions → media rights confirmation → project review → public project page → unit availability refresh → enquiry/visit → lead assignment/follow-up.
4. Buyer/renter: city and purpose selection → search/map/filter → detailed listing → full cost breakdown → save/compare → consented enquiry → confirmation/reference → visit request and confirmation status → follow-up/report.
5. Admin: role-based access → evidence review → sample/duplicate detection → approve/reject → audit log → user report handling → stale listing expiry → source/verification expiry → moderation metrics.
6. Negative cases: unauthorised user cannot edit another user's listing or see private fields; unverified/sample/stale inventory never appears as live verified; failed photo upload leaves no incomplete listing; consent required; duplicate/spam requests are limited; estimates handle missing/zero/unknown values safely.

## Important implementation boundary
The currently inspected property form only captures a subset of these fields. The listing detail page already shows several property facts, a basic EMI calculator, document checklist, enquiry and visit paths. The cost estimator added in this branch is a first implementation layer; it is not proof that all workflows, market data ingestion, ranking, legal calculations, or production acceptance tests are complete.

## Data sources and governance
Prefer first-party owner/agent submissions with documented authority, developer-authorised feeds/material, MahaRERA public project/agent records, and IGR Maharashtra official calculators/rules. Third-party portal inventory requires an authorised/licensed feed and reuse rights. Save source URL/reference, retrieval/verification timestamp, permitted-use basis and reviewer for each imported record. No synthetic names, prices, photos, phone numbers, availability, reviews or rankings in production.
