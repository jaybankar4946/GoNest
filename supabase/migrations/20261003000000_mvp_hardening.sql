-- GoNest MVP hardening (minimal; your schema already has RLS, is_admin, admin_moderate_listing).
-- Safe to re-run.

alter table public.listings add column if not exists amenities text[] not null default '{}';
alter table public.listings add column if not exists video_url text;
alter table public.listings add column if not exists availability text not null default 'available';
create index if not exists listings_search_idx on public.listings (status, purpose, city_id, price);

-- 1. Owners could set their own listing to 'active' / featured / verified (listings_update_own has no column guard). Block it.
create or replace function public.protect_listing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.featured := old.featured;
    new.verification_level := old.verification_level;
    new.rejection_reason := old.rejection_reason;
    new.posted_by := old.posted_by;
    if new.status::text not in ('archived','pending_review','draft') then new.status := old.status; end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_listing_trg on public.listings;
create trigger protect_listing_trg before update on public.listings for each row execute function public.protect_listing();

-- 2. Signup role (owner/agent) now comes from signup metadata; never admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email,
    case when new.raw_user_meta_data->>'role' in ('owner','agent')
         then (new.raw_user_meta_data->>'role')::public.user_role else 'buyer'::public.user_role end)
  on conflict (id) do nothing;
  return new;
end $$;

-- 3. Agent/owner directory is public; hide the email column from anon/authenticated (admins use the dashboard/service role).
do $$ declare cols text; begin
  select string_agg(quote_ident(column_name), ', ') into cols from information_schema.columns
   where table_schema = 'public' and table_name = 'profiles' and column_name <> 'email';
  execute 'revoke select on public.profiles from anon, authenticated';
  execute format('grant select (%s) on public.profiles to anon, authenticated', cols);
end $$;

-- 4. Storage: users upload only into their own folder of the public listing-images bucket.
insert into storage.buckets (id, name, public) values ('listing-images','listing-images',true) on conflict (id) do nothing;
drop policy if exists p_st_ins on storage.objects;
create policy p_st_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists p_st_del on storage.objects;
create policy p_st_del on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
