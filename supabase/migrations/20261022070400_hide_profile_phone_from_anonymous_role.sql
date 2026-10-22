-- Direct contact buttons have been removed in favour of GoNest enquiries.
-- Do not expose profile phone numbers through anonymous PostgREST table queries.
REVOKE SELECT (phone) ON TABLE public.profiles FROM anon;
