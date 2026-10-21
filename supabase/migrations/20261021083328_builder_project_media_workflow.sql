create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.real_estate_projects(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  constraint project_media_sort_order_nonnegative check (sort_order >= 0)
);
alter table public.project_media enable row level security;
revoke all on public.project_media from anon, authenticated;
grant select, insert, update, delete on public.project_media to authenticated;
grant select on public.project_media to anon;
create policy project_media_public_read on public.project_media for select to anon, authenticated
using (is_sample = false and exists (select 1 from public.real_estate_projects p where p.id=project_media.project_id and p.is_sample=false and p.verification_status='verified' and p.official_project_url is not null));
create policy project_media_owner_read on public.project_media for select to authenticated using (created_by_user_id=auth.uid() or public.is_admin());
create policy project_media_builder_insert on public.project_media for insert to authenticated
with check (created_by_user_id=auth.uid() and is_sample=false and exists (select 1 from public.profiles pr join public.real_estate_projects p on p.created_by_user_id=pr.id where pr.id=auth.uid() and pr.role::text='builder' and p.id=project_media.project_id));
create policy project_media_builder_update on public.project_media for update to authenticated
using (created_by_user_id=auth.uid() and exists (select 1 from public.profiles pr where pr.id=auth.uid() and pr.role::text='builder'))
with check (created_by_user_id=auth.uid() and is_sample=false and exists (select 1 from public.real_estate_projects p where p.id=project_media.project_id and p.created_by_user_id=auth.uid()));
create policy project_media_builder_delete on public.project_media for delete to authenticated
using (created_by_user_id=auth.uid() and exists (select 1 from public.profiles pr where pr.id=auth.uid() and pr.role::text='builder'));
create index if not exists project_media_project_sort_idx on public.project_media(project_id,sort_order);
