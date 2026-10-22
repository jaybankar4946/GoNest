-- Prevent authenticated profile owners from altering system-managed reputation and sample metadata.
-- User-editable profile fields remain governed by profiles_update_own and existing column grants.
REVOKE UPDATE (rating, review_count, total_listings, is_sample, created_at, updated_at)
ON TABLE public.profiles FROM authenticated;
