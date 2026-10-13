-- Trigger-only function; do not expose it as a callable PostgREST RPC.
-- Trigger invocation does not require caller EXECUTE privileges.
revoke all on function public.guard_listing_interaction_target() from public;
revoke all on function public.guard_listing_interaction_target() from anon;
revoke all on function public.guard_listing_interaction_target() from authenticated;
