-- GoNest MVP hardening. Idempotent. Run in Supabase SQL editor or `supabase db push`.
-- After running: Dashboard > Authentication > Policies, delete any OLD permissive policies on these tables.

alter table listings add column if not exists amenities text[] not null default '{}';
alter table listings add column if not exists video_url text;
alter table listings add column if not exists availability text not null default 'available';
create index if not exists listings_search_idx on listings (status, purpose, city_id, price);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- New users: role comes from signup metadata, never 'admin'
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role, email)
  values (new.id, new.raw_user_meta_data->>'full_name',
    case when new.raw_user_meta_data->>'role' in ('owner','agent') then new.raw_user_meta_data->>'role' else 'buyer' end,
    new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Block self-promotion / self-verification on profiles
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role = 'admin' then new.role := old.role; end if;
    new.agent_verified := old.agent_verified;
    new.phone_verified := old.phone_verified;
    new.rating := old.rating; new.review_count := old.review_count; new.total_listings := old.total_listings;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_trg on profiles;
create trigger protect_profile_trg before update on profiles for each row execute function public.protect_profile();

-- Block owners from approving/featuring their own listings
create or replace function public.protect_listing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.featured := old.featured; new.verification_level := old.verification_level;
    new.rejection_reason := old.rejection_reason; new.posted_by := old.posted_by;
    if new.status not in ('archived','pending_review','draft') then new.status := old.status; end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_listing_trg on listings;
create trigger protect_listing_trg before update on listings for each row execute function public.protect_listing();

create or replace function public.admin_moderate_listing(p_listing_id uuid, p_new_status text, p_new_verification text, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update listings set status = p_new_status, verification_level = p_new_verification,
    rejection_reason = p_reason,
    published_at = case when p_new_status = 'active' then coalesce(published_at, now()) else published_at end
  where id = p_listing_id;
end $$;

-- Hide email from the public; keep phone/agency/RERA (needed for contact flow)
revoke select on profiles from anon, authenticated;
grant select (id, full_name, phone, phone_verified, role, agency_name, rera_number, agent_verified,
              avatar_url, bio, total_listings, rating, review_count, created_at) on profiles to anon, authenticated;

alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table leads enable row level security;
alter table visits enable row level security;
alter table saved_listings enable row level security;
alter table cities enable row level security;
alter table localities enable row level security;

drop policy if exists p_profiles_read on profiles;   create policy p_profiles_read on profiles for select using (true);
drop policy if exists p_profiles_upd on profiles;    create policy p_profiles_upd on profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists p_listings_read on listings;   create policy p_listings_read on listings for select using (status = 'active' or posted_by = auth.uid() or public.is_admin());
drop policy if exists p_listings_ins on listings;    create policy p_listings_ins on listings for insert with check (posted_by = auth.uid() and status = 'pending_review' and featured = false);
drop policy if exists p_listings_upd on listings;    create policy p_listings_upd on listings for update using (posted_by = auth.uid() or public.is_admin());
drop policy if exists p_listings_del on listings;    create policy p_listings_del on listings for delete using (public.is_admin());

drop policy if exists p_img_read on listing_images;  create policy p_img_read on listing_images for select using (true);
drop policy if exists p_img_write on listing_images; create policy p_img_write on listing_images for all
  using (exists (select 1 from listings l where l.id = listing_id and (l.posted_by = auth.uid() or public.is_admin())))
  with check (exists (select 1 from listings l where l.id = listing_id and (l.posted_by = auth.uid() or public.is_admin())));

drop policy if exists p_leads_ins on leads;          create policy p_leads_ins on leads for insert with check (buyer_id is null or buyer_id = auth.uid());
drop policy if exists p_leads_read on leads;         create policy p_leads_read on leads for select using (public.is_admin() or buyer_id = auth.uid()
  or exists (select 1 from listings l where l.id = listing_id and l.posted_by = auth.uid()));
drop policy if exists p_leads_upd on leads;          create policy p_leads_upd on leads for update using (public.is_admin()
  or exists (select 1 from listings l where l.id = listing_id and l.posted_by = auth.uid()));

drop policy if exists p_visits_ins on visits;        create policy p_visits_ins on visits for insert with check (requested_by is null or requested_by = auth.uid());
drop policy if exists p_visits_read on visits;       create policy p_visits_read on visits for select using (public.is_admin() or requested_by = auth.uid()
  or exists (select 1 from listings l where l.id = listing_id and l.posted_by = auth.uid()));
drop policy if exists p_visits_upd on visits;        create policy p_visits_upd on visits for update using (public.is_admin()
  or exists (select 1 from listings l where l.id = listing_id and l.posted_by = auth.uid()));

drop policy if exists p_saved_all on saved_listings; create policy p_saved_all on saved_listings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists p_cities_read on cities;       create policy p_cities_read on cities for select using (true);
drop policy if exists p_cities_write on cities;      create policy p_cities_write on cities for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists p_loc_read on localities;      create policy p_loc_read on localities for select using (true);
drop policy if exists p_loc_write on localities;     create policy p_loc_write on localities for all using (public.is_admin()) with check (public.is_admin());

-- Storage: public bucket, users upload only into their own folder
insert into storage.buckets (id, name, public) values ('listing-images','listing-images',true) on conflict (id) do nothing;
drop policy if exists p_st_ins on storage.objects;   create policy p_st_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists p_st_del on storage.objects;   create policy p_st_del on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
