-- Applied to Supabase project uqyakeftmgnjhebbfiuh on 2026-11-03.
-- Keep this migration in source control so fresh environments receive the same workflow protections.
create or replace function public.guard_listing_owner_updates()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  if public.is_admin() then return new; end if;
  if auth.uid() is null or old.posted_by <> auth.uid() then
    raise exception 'You are not allowed to edit this listing.' using errcode = '42501';
  end if;
  if new.posted_by is distinct from old.posted_by
    or new.poster_type is distinct from old.poster_type
    or new.verification_level is distinct from old.verification_level
    or new.verified is distinct from old.verified
    or new.rejection_reason is distinct from old.rejection_reason
    or new.featured is distinct from old.featured
    or new.featured_until is distinct from old.featured_until
    or new.is_sample is distinct from old.is_sample
    or new.view_count is distinct from old.view_count
    or new.lead_count is distinct from old.lead_count
    or new.saved_count is distinct from old.saved_count
    or new.published_at is distinct from old.published_at
    or new.risk_flags is distinct from old.risk_flags then
    raise exception 'Moderation, trust, ownership and analytics fields cannot be changed by listing owners.' using errcode = '42501';
  end if;
  if new.status is distinct from old.status
    and new.status not in ('pending_review'::public.listing_status, 'archived'::public.listing_status, 'sold'::public.listing_status, 'rented'::public.listing_status) then
    raise exception 'Owners may only submit, archive, or mark a listing sold or rented.' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_listing_owner_updates on public.listings;
create trigger guard_listing_owner_updates before update on public.listings
for each row execute function public.guard_listing_owner_updates();

grant update (status, notes) on public.leads to authenticated;
drop policy if exists leads_update_owner on public.leads;
create policy leads_update_owner on public.leads for update to authenticated
using (exists (select 1 from public.listings l where l.id = leads.listing_id and l.posted_by = (select auth.uid())))
with check (exists (select 1 from public.listings l where l.id = leads.listing_id and l.posted_by = (select auth.uid())));

grant update (status, confirmed_by, confirmed_at, completed_at) on public.visits to authenticated;
drop policy if exists visits_update_owner on public.visits;
create policy visits_update_owner on public.visits for update to authenticated
using (exists (select 1 from public.listings l where l.id = visits.listing_id and l.posted_by = (select auth.uid())))
with check (exists (select 1 from public.listings l where l.id = visits.listing_id and l.posted_by = (select auth.uid())));

grant update (registered_name, operating_brand, website_url, public_business_address, public_phone, public_enquiry_url, city_id, rera_registration, operating_cities)
on public.developers to authenticated;
grant update (official_name, alternate_names, city_id, locality_id, public_address, latitude, longitude, rera_number, project_category, construction_status, launch_date, expected_possession_date, total_units, configurations, published_price_min_inr, published_price_max_inr, official_project_url, brochure_url, inventory_status, cover_image_url, gallery_image_urls, image_source_url, pincode, landmark, neighbourhood, rera_source_url)
on public.real_estate_projects to authenticated;

grant update (business_name, website_url, public_business_phone, public_enquiry_url, public_business_address, city_id, localities, rera_registration)
on public.brokerages to authenticated;
drop policy if exists brokerages_update_own on public.brokerages;
create policy brokerages_update_own on public.brokerages for update to authenticated
using (created_by_user_id = (select auth.uid()))
with check (created_by_user_id = (select auth.uid()) and is_sample = false and verification_status in ('unverified','pending'));
