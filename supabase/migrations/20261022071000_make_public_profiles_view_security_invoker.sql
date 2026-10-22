CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier = true, security_invoker = true)
AS
SELECT id, full_name, role, agency_name, rera_number, agent_verified,
       avatar_url, bio, total_listings, rating, review_count, created_at
FROM public.profiles
WHERE coalesce(is_sample, false) = false
  AND role::text IN ('owner','agent','builder');

GRANT SELECT ON public.public_profiles TO anon, authenticated;
