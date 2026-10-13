
alter function public.book_visit(uuid, text, text, text, date, text, integer, text, text, boolean) set search_path = pg_catalog, public, pg_temp;
alter function public.get_booked_slots(uuid, date) set search_path = pg_catalog, public, pg_temp;
alter function public.increment_listing_views(uuid) set search_path = pg_catalog, public, pg_temp;
alter function public.is_admin() set search_path = pg_catalog, public, pg_temp;
alter function public.track_event(text, text, uuid, jsonb) set search_path = pg_catalog, public, pg_temp;
alter function public.admin_funnel(integer) set search_path = pg_catalog, public, pg_temp;
alter function public.admin_moderate_listing(uuid, public.listing_status, public.verification_level, text) set search_path = pg_catalog, public, pg_temp;
alter function public.admin_resolve_report(uuid, text, text) set search_path = pg_catalog, public, pg_temp;
alter function public.choose_account_type(text) set search_path = pg_catalog, public, pg_temp;
alter function public.fmt_inr(numeric) set search_path = pg_catalog, public, pg_temp;
