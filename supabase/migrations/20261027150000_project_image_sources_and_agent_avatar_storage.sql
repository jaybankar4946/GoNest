-- Project image provenance and agent avatar storage.
-- Project image URLs must point to curated, source-backed assets; do not infer unit availability from project photography.

alter table public.real_estate_projects
  add column if not exists cover_image_url text,
  add column if not exists gallery_image_urls text[] not null default '{}',
  add column if not exists image_source_url text,
  add column if not exists image_checked_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'real_estate_projects_cover_image_url_http_check') then
    alter table public.real_estate_projects add constraint real_estate_projects_cover_image_url_http_check
      check (cover_image_url is null or cover_image_url ~ '^https?://') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'real_estate_projects_image_source_url_http_check') then
    alter table public.real_estate_projects add constraint real_estate_projects_image_source_url_http_check
      check (image_source_url is null or image_source_url ~ '^https?://') not valid;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agent-avatars', 'agent-avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can view agent avatars') then
    create policy "Public can view agent avatars" on storage.objects for select to public using (bucket_id = 'agent-avatars');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload own agent avatar') then
    create policy "Users upload own agent avatar" on storage.objects for insert to authenticated
      with check (bucket_id = 'agent-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update own agent avatar') then
    create policy "Users update own agent avatar" on storage.objects for update to authenticated
      using (bucket_id = 'agent-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'agent-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete own agent avatar') then
    create policy "Users delete own agent avatar" on storage.objects for delete to authenticated
      using (bucket_id = 'agent-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
