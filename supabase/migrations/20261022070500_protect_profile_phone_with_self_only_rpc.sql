-- Keep profile phone numbers private from anonymous and other signed-in users.
-- The owner retrieves only their own number via get_my_profile_phone().
REVOKE SELECT (phone) ON TABLE public.profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile_phone()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
  SELECT p.phone
  FROM public.profiles p
  WHERE p.id = auth.uid()
    AND auth.uid() IS NOT NULL;
$function$;

REVOKE ALL ON FUNCTION public.get_my_profile_phone() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile_phone() TO authenticated;
