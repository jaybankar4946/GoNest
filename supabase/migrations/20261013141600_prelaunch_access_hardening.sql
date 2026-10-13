-- GoNest pre-launch access hardening.
-- Restrict public access to explicitly designated demo inventory and prevent
-- public lead/visit submissions against sample or inactive listings.
-- This migration is additive/idempotent and does not modify existing records.

drop policy if exists listings_select_public on public.listings;
create policy listings_select_public
  on public.listings
  for select
  using (
    (status = 'active'::public.listing_status and is_sample = false)
    or (is_sample = true and slug like 'demo-thane-west-%')
    or (posted_by = auth.uid())
    or public.is_admin()
  );

-- Price history should not reveal historical prices for drafts, archived,
-- rejected, suspended, sold or rented listings to the public.
drop policy if exists price_history_read on public.listing_price_history;
create policy price_history_read
  on public.listing_price_history
  for select
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_price_history.listing_id
        and (
          (l.status = 'active'::public.listing_status and l.is_sample = false)
          or l.posted_by = auth.uid()
          or public.is_admin()
        )
    )
  );

-- A SECURITY DEFINER RPC can bypass table RLS, so enforce the listing eligibility
-- at the table boundary too. The same guard protects the normal client insert
-- paths and the book_visit RPC. Only new interactions are affected.
create or replace function public.guard_listing_interaction_target()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if not exists (
    select 1
    from public.listings l
    where l.id = new.listing_id
      and l.status = 'active'::public.listing_status
      and l.is_sample = false
  ) then
    raise exception 'listing_unavailable'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_lead_listing_target on public.leads;
create trigger guard_lead_listing_target
  before insert or update of listing_id on public.leads
  for each row execute function public.guard_listing_interaction_target();

drop trigger if exists guard_visit_listing_target on public.visits;
create trigger guard_visit_listing_target
  before insert or update of listing_id on public.visits
  for each row execute function public.guard_listing_interaction_target();

-- Users should be able to mark their own notifications as read, not rewrite
-- notification content or links.
revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;
