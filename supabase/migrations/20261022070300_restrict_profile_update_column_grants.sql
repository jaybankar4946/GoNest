-- Restrict profile updates to user-editable fields plus admin-managed role/verification fields.
-- Row-level policy profiles_update_own prevents self-service role/agent verification changes;
-- profiles_admin_all permits authorised admins to manage those fields.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE UPDATE (id, full_name, phone, email, role, agency_name, agent_verified, builder_verified, phone_verified, rera_number, avatar_url, bio, rating, review_count, total_listings, is_sample, created_at, updated_at)
ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, agency_name, bio, rera_number, avatar_url, role, agent_verified)
ON TABLE public.profiles TO authenticated;
