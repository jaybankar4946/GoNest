# Thane West demo inventory

This seed is a QA dataset, not live real-estate inventory.

## Included data
- 50 synthetic listing rows in `public.listings`: 20 Buy/resale, 15 Rent, 15 New-project sample units.
- 10 agency examples in `public.gonest_demo_agents`.
- 10 developer examples in `public.gonest_demo_builders`.
- 10 synthetic project records in `public.gonest_demo_projects`.
- One source/confirmation record per listing in `public.gonest_demo_listing_sources`.

## Safety and correctness
- Every seeded listing has `is_sample = true`, a `[DEMO NN]` title, `sample_data` risk flag and `unverified` verification level.
- All synthetic source rows use `confirmation_status = 'sample_only'`; `last_confirmed_at` is null.
- The developer names are directory examples only. The project titles are synthetic and do not claim a real project relationship, current inventory, RERA registration or Thane West presence.
- No agent phone, email, personal contact, RERA number, rating or verified badge is fabricated.
- Demo agency rows live in a separate demo table; they are not fake Supabase Auth users or production agent profiles.
- The seed temporarily disables only the existing new-listing rate-limit trigger for this explicit bulk QA import, then re-enables it in the same transaction. Other triggers remain enabled.
- The public demo dashboard is at `/demo-inventory`. It is a read-only QA view, not a production inventory administration screen.

## Before using real inventory
Replace synthetic records with authorized supplier data, verify project and agent information against official records (including MahaRERA where applicable), record the source and timestamp of each availability confirmation, and ensure the live listing has an appropriate consent/authorization trail. Never display sample records as verified offers.
