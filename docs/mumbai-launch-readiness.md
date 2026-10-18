# GoNest Mumbai launch readiness

## Scope of this branch
This branch improves buyer/developer entry points and the new-homes discovery page. It does not claim that all platform workflows have been implemented or production-tested.

## Ten-point acceptance checklist

1. **Homepage conversion:** verify the primary buyer search, Explore New Homes, and developer onboarding links at mobile and desktop widths.
2. **Developer inventory intake:** existing /dashboard/new is an individual listing flow. A secure multi-unit project intake needs a dedicated schema, ownership model, draft lifecycle, file storage rules, and review queue before it is considered complete.
3. **Buyer discovery:** test location, budget, BHK, purpose, possession, RERA data availability, saved homes, and enquiry submission against real records.
4. **Listing cards:** display only fields present in the listing data; include update freshness when a reliable timestamp exists.
5. **New Projects:** /projects currently provides a dedicated residential discovery entry point over available apartment listings. It is not yet a true project/unit catalogue.
6. **Verification:** distinguish received documents, checks completed, and pending checks. Never describe platform verification as a title guarantee.
7. **Inventory freshness:** define the confirmation SLA and stale thresholds with operations; hide or label stale inventory rather than implying availability.
8. **AI claims:** do not publish match-accuracy, appreciation forecasts, or real-time claims without a documented metric, source, evaluation, and update cadence.
9. **Responsive/accessibility:** keyboard-test all controls, visible focus, label form fields, review errors, image sizes, and test 360px, tablet, and desktop layouts.
10. **Enquiry lifecycle:** confirm successful submissions, lead ownership, consent capture, notifications, status transitions, and conversion analytics end to end.

## Known production gate from the connected Supabase advisor scan (2026-10-18)

- Security advisor reports public execution of multiple SECURITY DEFINER functions. Review each function's intended anonymous/public access and authorization checks before revoking grants; some functions (e.g. booking or event tracking) may intentionally support anonymous users.
- Security advisor reports RLS enabled without policies on `public.events` and `public.notification_outbox`. Confirm whether these are service-only tables; do not add broad client policies just to silence the warning.
- Performance advisor reports 15 foreign keys without covering indexes, including events, listing reports/reviews, notifications, saved listings/searches, verification log, and visits. Add indexes only after checking existing indexes and query patterns.
- The current Vercel project has a READY production deployment, but deployment readiness alone does not validate live user journeys or business correctness.

## Launch rule
Do not call GoNest launch-ready until a preview build passes, the Supabase findings have been reviewed, and buyer/developer/enquiry flows have been tested using non-production test accounts and records.
