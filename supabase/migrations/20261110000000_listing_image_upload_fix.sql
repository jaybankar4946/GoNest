-- Fix listing photo RLS for authenticated listing owners.
-- Storage paths are always scoped to auth.uid()/listing-id/filename.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

drop policy if exists listing_images_insert_owner on public.listing_images;
create policy listing_images_insert_owner
on public.listing_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (l.posted_by = auth.uid() or public.is_admin())
  )
);

drop policy if exists listing_images_update_owner on public.listing_images;
create policy listing_images_update_owner
on public.listing_images
for update
to authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (l.posted_by = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (l.posted_by = auth.uid() or public.is_admin())
  )
);

drop policy if exists listing_images_delete_owner on public.listing_images;
create policy listing_images_delete_owner
on public.listing_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (l.posted_by = auth.uid() or public.is_admin())
  )
);

drop policy if exists listing_images_storage_insert_owner on storage.objects;
create policy listing_images_storage_insert_owner
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists listing_images_storage_update_owner on storage.objects;
create policy listing_images_storage_update_owner
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
)
with check (
  bucket_id = 'listing-images'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists listing_images_storage_delete_owner on storage.objects;
create policy listing_images_storage_delete_owner
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
