-- Migration 20261019020442_restrict_admin_rpc_execution_20261019
revoke execute on function public.admin_funnel(integer) from public, anon;
revoke execute on function public.admin_moderate_listing(uuid, public.listing_status, public.verification_level, text) from public, anon;
revoke execute on function public.admin_resolve_report(uuid, text, text) from public, anon;
revoke execute on function public.choose_account_type(text) from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.admin_funnel(integer) to authenticated;
grant execute on function public.admin_moderate_listing(uuid, public.listing_status, public.verification_level, text) to authenticated;
grant execute on function public.admin_resolve_report(uuid, text, text) to authenticated;
grant execute on function public.choose_account_type(text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
