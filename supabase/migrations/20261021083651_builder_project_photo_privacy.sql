insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', false)
on conflict (id) do update set public = false;

drop policy if exists project_images_read_authorized on storage.objects;
create policy project_images_read_authorized on storage.objects for select to anon, authenticated
using (
  bucket_id = 'project-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.project_media pm
      join public.real_estate_projects p on p.id = pm.project_id
      where pm.storage_path = objects.name and pm.is_sample = false
        and p.is_sample = false and p.verification_status = 'verified'
        and p.official_project_url is not null
    )
  )
);

drop policy if exists project_images_upload_own_folder on storage.objects;
create policy project_images_upload_own_folder on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists project_images_update_own_folder on storage.objects;
create policy project_images_update_own_folder on storage.objects for update to authenticated
using (bucket_id = 'project-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists project_images_delete_own_folder on storage.objects;
create policy project_images_delete_own_folder on storage.objects for delete to authenticated
using (bucket_id = 'project-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
