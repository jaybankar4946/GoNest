-- Remove the legacy public sample-inventory SELECT policy.
-- Sample records remain visible to admins through listings_admin_all / is_admin().
-- Public marketplace queries must only read non-sample active listings.
drop policy if exists listings_select_public_demo_samples on public.listings;
