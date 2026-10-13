-- Pin search_path for existing SECURITY DEFINER trigger/helper functions.
-- No function bodies or grants are changed by this migration.

alter function public.adjust_saved_count() set search_path = pg_catalog, public, pg_temp;
alter function public.audit_listing_change() set search_path = pg_catalog, public, pg_temp;
alter function public.audit_profile_change() set search_path = pg_catalog, public, pg_temp;
alter function public.bump_lead_count() set search_path = pg_catalog, public, pg_temp;
alter function public.enforce_consent() set search_path = pg_catalog, public, pg_temp;
alter function public.flag_new_listing() set search_path = pg_catalog, public, pg_temp;
alter function public.flag_reported_listing() set search_path = pg_catalog, public, pg_temp;
alter function public.handle_new_user() set search_path = pg_catalog, public, pg_temp;
alter function public.limit_enquiries() set search_path = pg_catalog, public, pg_temp;
alter function public.notify(uuid, text, text, text, text, uuid) set search_path = pg_catalog, public, pg_temp;
alter function public.on_lead_insert() set search_path = pg_catalog, public, pg_temp;
alter function public.on_lead_status() set search_path = pg_catalog, public, pg_temp;
alter function public.on_listing_status() set search_path = pg_catalog, public, pg_temp;
alter function public.on_visit_insert() set search_path = pg_catalog, public, pg_temp;
alter function public.on_visit_status() set search_path = pg_catalog, public, pg_temp;
alter function public.protect_listing() set search_path = pg_catalog, public, pg_temp;
alter function public.recalc_total_listings() set search_path = pg_catalog, public, pg_temp;
alter function public.record_price_history() set search_path = pg_catalog, public, pg_temp;
alter function public.refresh_city_listing_counts() set search_path = pg_catalog, public, pg_temp;
alter function public.set_listing_published_at() set search_path = pg_catalog, public, pg_temp;
alter function public.set_listing_slug() set search_path = pg_catalog, public, pg_temp;
