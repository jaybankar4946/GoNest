-- Keep the owner guard active for every update, but preserve system-managed
-- values instead of rejecting otherwise-valid property-detail edits.
create or replace function public.guard_listing_owner_updates()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if current_user = 'postgres' or public.is_admin() then
    return new;
  end if;

  if auth.uid() is null or old.posted_by <> auth.uid() then
    raise exception 'You are not allowed to edit this listing.' using errcode = '42501';
  end if;

  new.posted_by := old.posted_by;
  new.poster_type := old.poster_type;
  new.verification_level := old.verification_level;
  new.verified := old.verified;
  new.rejection_reason := old.rejection_reason;
  new.featured := old.featured;
  new.featured_until := old.featured_until;
  new.is_sample := old.is_sample;
  new.view_count := old.view_count;
  new.lead_count := old.lead_count;
  new.saved_count := old.saved_count;
  new.published_at := old.published_at;
  new.risk_flags := old.risk_flags;

  if new.status is distinct from old.status
     and new.status not in ('pending_review'::public.listing_status,
                            'archived'::public.listing_status,
                            'sold'::public.listing_status,
                            'rented'::public.listing_status) then
    raise exception 'Owners may only submit, archive, or mark a listing sold or rented.'
      using errcode = '42501';
  end if;

  return new;
end;
$function$;

drop trigger if exists guard_listing_owner_updates on public.listings;
create trigger guard_listing_owner_updates
before update on public.listings
for each row execute function public.guard_listing_owner_updates();
