# GoNest supply demo and end-to-end acceptance checklist

**Target production baseline (do not replace without explicit approval):**
`https://gonest-ledt84vn3-jackfink9663-hues-projects.vercel.app`

This checklist is for a staging/preview deployment built from the production baseline plus reviewed changes. Do not create fake verified inventory or use sample records as live inventory.

## Demo accounts to create through the public signup flow

Use dedicated test email addresses that the project owner controls. Never commit passwords, auth tokens, phone numbers, or service-role keys.

- Owner demo: choose **Owner** during signup.
- Agent demo: choose **Agent** during signup; test the agent profile and listing form.
- Builder/developer demo: choose **Builder** during signup; test project creation and image upload.
- Buyer demo: choose **Buyer** during signup; test browsing, enquiry, and visit request.

Confirm each account's email using the actual Supabase email flow. Do not assign roles by editing user metadata manually; authorization must come from the trusted profile/role workflow.

## Demo submission scenarios

Use clearly fictional test-only details, and label each title/description as DEMO. Never use a real person's contact details or claim verification.

1. Owner — one rental apartment in Mumbai and one resale apartment in Pune.
2. Agent — complete profile and one rental plus one resale listing.
3. Builder/developer — one sample project in Mumbai with at least two configuration rows if supported by the UI, and project images uploaded through the form.
4. Buyer — search, open a listing, send an enquiry, and request a visit.

Keep all demo submissions in draft or pending review. They must not appear as verified/available public inventory until reviewed. Remove or archive demo records before a public launch.

## Pass/fail checks

- [ ] Signup captures the selected role and email confirmation completes.
- [ ] Unauthenticated users are redirected to login before protected forms.
- [ ] Owner/agent can create a draft, upload photos, submit for review, edit their own submission, and see status.
- [ ] Builder can create a project, upload images, and view project enquiries.
- [ ] A user cannot edit or delete another user's inventory by changing an ID in the URL/API.
- [ ] Admin can review, reject with a reason, or approve submissions; approval is the only path to public inventory.
- [ ] Public listing and agent pages load without querying private profile fields or exposing phone/email.
- [ ] Buyer enquiry and visit requests persist and appear to the intended supplier.
- [ ] Duplicate/freshness checks and image validation behave correctly.
- [ ] Production URL, domains, and chosen production commit remain unchanged until the preview passes all checks.

## Current known blocker

The production runtime error scan has reported `permission denied for table profiles` on `/property/[id]`. A reviewed code change on this branch switches public property/profile joins to the safe `public_profiles` view and removes phone from the public profile selection. Verify this against a preview before any production promotion.

## Release rule

Do not claim end-to-end completion until the four dedicated test accounts have completed the workflows above and the preview passes build, route smoke tests, and security checks. Never promote this branch automatically to the pinned production baseline.
