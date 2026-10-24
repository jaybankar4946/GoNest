# GoNest Property Data Strategy

## Supply priority
1. Direct owner submissions.
2. Authorized agent/broker submissions.
3. Brokerage partnerships and licensed feeds.
4. Public datasets only where licensing and reuse permit.
5. User-submitted corrections and controlled manual onboarding.

Do not assume a third-party portal API exists. Do not bypass login, CAPTCHA, rate limits, access controls, or contractual restrictions to collect listings.

## Listing provenance fields
Capture source/submission method, submitter identity, authorization evidence where appropriate, last-confirmed availability, verification status, reviewer, review time, expiry/revalidation time, and correction/report history.

## Suggested verification vocabulary
- **Unverified:** submitted but not checked beyond basic validation.
- **Contact checked:** a contact channel was checked; property claims are not thereby verified.
- **Authorization reviewed:** evidence of the submitter's authority was reviewed.
- **Supporting documents reviewed:** specified documents were reviewed; this is not necessarily legal-title verification.
- **Independently corroborated:** a clearly described fact was corroborated using an identified reliable source.

Display the actual checks and dates. Avoid a generic “verified property” badge. Never imply title, ownership, encumbrance, or regulatory status is legally verified unless qualified evidence and processes support that exact claim.

## Operations
Create queues for stale, duplicated, suspiciously priced, reported, and incomplete listings. Define expiry, pause, archive, appeal, and correction procedures. Record every moderation action and the reason.

## Pilot
Manually onboard a small cohort of authorized listings in one configured geography. Measure availability freshness and the time/cost required to acquire and maintain each listing before scaling inventory.
