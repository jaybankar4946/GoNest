-- Supply-side launch: builder accounts and owned project submissions.
alter type public.user_role add value if not exists 'builder';
-- Existing sourced records remain unchanged; new user submissions are always pending/unverified.

alter table public.profiles add column if not exists builder_verified boolean not null default false;
alter table public.developers add column if not exists created_by_user_id uuid references auth.users(id) on delete set null;
alter table public.real_estate_projects add column if not exists created_by_user_id uuid references auth.users(id) on delete set null;
alter table public.project_inventory_observations add column if not exists created_by_user_id uuid references auth.users(id) on delete set null;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare requested_role text;
begin
  requested_role := new.raw_user_meta_data->>'role';
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    case when requested_role in ('owner','agent','builder')
      then requested_role::public.user_role
      else 'buyer'::public.user_role end
  )
  on conflict (id) do nothing;
  return new;
end
$function$;

create or replace function public.choose_account_type(p_role text)
returns void language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $function$
begin
  if auth.uid() is null then raise exception using errcode='28000', message='not_authenticated'; end if;
  if p_role not in ('owner','agent','builder') then
    raise exception using errcode='22023', message='invalid_role';
  end if;
  update public.profiles
     set role = p_role::public.user_role
   where id = auth.uid() and role = 'buyer'::public.user_role;
  if not found then
    if not exists(select 1 from public.profiles where id=auth.uid() and role::text=p_role) then
      raise exception using errcode='42501', message='account_type_change_not_allowed';
    end if;
  end if;
end
$function$;
revoke all on function public.choose_account_type(text) from public, anon;
grant execute on function public.choose_account_type(text) to authenticated;

drop policy if exists developers_insert_own_builder on public.developers;
create policy developers_insert_own_builder on public.developers
for insert to authenticated
with check (created_by_user_id = auth.uid()
  and is_sample = false
  and verification_status in ('unverified','pending')
  and exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='builder'));

drop policy if exists developers_select_own_builder on public.developers;
create policy developers_select_own_builder on public.developers
for select to authenticated
using (created_by_user_id = auth.uid() or public.is_admin());

drop policy if exists developers_update_own_builder on public.developers;
create policy developers_update_own_builder on public.developers
for update to authenticated
using (created_by_user_id = auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role::text='builder'))
with check (created_by_user_id = auth.uid() and is_sample=false and verification_status in ('unverified','pending'));

drop policy if exists projects_insert_own_builder on public.real_estate_projects;
create policy projects_insert_own_builder on public.real_estate_projects
for insert to authenticated
with check (created_by_user_id = auth.uid() and is_sample=false
  and verification_status in ('unverified','pending')
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role::text='builder')
  and exists(select 1 from public.developers d where d.id=developer_id and d.created_by_user_id=auth.uid()));

drop policy if exists projects_select_own_builder on public.real_estate_projects;
create policy projects_select_own_builder on public.real_estate_projects
for select to authenticated
using (created_by_user_id=auth.uid() or public.is_admin());

drop policy if exists projects_update_own_builder on public.real_estate_projects;
create policy projects_update_own_builder on public.real_estate_projects
for update to authenticated
using (created_by_user_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role::text='builder'))
with check (created_by_user_id=auth.uid() and is_sample=false and verification_status in ('unverified','pending')
  and exists(select 1 from public.developers d where d.id=developer_id and d.created_by_user_id=auth.uid()));

drop policy if exists inventory_insert_own_builder on public.project_inventory_observations;
create policy inventory_insert_own_builder on public.project_inventory_observations
for insert to authenticated
with check (created_by_user_id = auth.uid() and is_sample=false
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role::text='builder')
  and exists(select 1 from public.real_estate_projects pr where pr.id=project_id and pr.created_by_user_id=auth.uid()));

drop policy if exists inventory_select_own_builder on public.project_inventory_observations;
create policy inventory_select_own_builder on public.project_inventory_observations
for select to authenticated
using (created_by_user_id=auth.uid() or public.is_admin());

drop policy if exists inventory_update_own_builder on public.project_inventory_observations;
create policy inventory_update_own_builder on public.project_inventory_observations
for update to authenticated
using (created_by_user_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role::text='builder'))
with check (created_by_user_id=auth.uid() and is_sample=false
  and exists(select 1 from public.real_estate_projects pr where pr.id=project_id and pr.created_by_user_id=auth.uid()));

create or replace function public.submit_builder_project(
  p_registered_name text,
  p_operating_brand text,
  p_website_url text,
  p_rera_registration text,
  p_project_name text,
  p_city_id uuid,
  p_locality_id uuid default null,
  p_public_address text default null,
  p_rera_number text default null,
  p_construction_status text default 'unknown',
  p_project_category text default 'residential',
  p_official_project_url text default null,
  p_inventory jsonb default '[]'::jsonb
) returns uuid
language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_developer_id uuid;
  v_project_id uuid;
  v_item jsonb;
begin
  if v_uid is null then raise exception using errcode='28000', message='not_authenticated'; end if;
  if not exists(select 1 from public.profiles where id=v_uid and role::text='builder') then
    raise exception using errcode='42501', message='builder_account_required';
  end if;
  if nullif(trim(p_registered_name),'') is null or nullif(trim(p_project_name),'') is null or p_city_id is null then
    raise exception using errcode='22023', message='builder_name_project_name_and_city_required';
  end if;
  if p_inventory is not null and jsonb_typeof(p_inventory) <> 'array' then
    raise exception using errcode='22023', message='inventory_must_be_an_array';
  end if;

  insert into public.developers
    (registered_name, operating_brand, website_url, rera_registration, verification_status, is_sample, created_by_user_id)
  values
    (trim(p_registered_name), nullif(trim(p_operating_brand),''), nullif(trim(p_website_url),''),
     nullif(trim(p_rera_registration),''), 'pending', false, v_uid)
  returning id into v_developer_id;

  insert into public.real_estate_projects
    (developer_id, official_name, city_id, locality_id, public_address, rera_number,
     project_category, construction_status, official_project_url, verification_status,
     inventory_status, is_sample, created_by_user_id)
  values
    (v_developer_id, trim(p_project_name), p_city_id, p_locality_id, nullif(trim(p_public_address),''),
     nullif(trim(p_rera_number),''), p_project_category, p_construction_status,
     nullif(trim(p_official_project_url),''), 'pending', 'unknown', false, v_uid)
  returning id into v_project_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_inventory,'[]'::jsonb))
  loop
    insert into public.project_inventory_observations
      (project_id, unit_reference, tower_name, floor_number, configuration,
       carpet_area_sqft, asking_price_inr, additional_charges_inr, availability_status,
       market_type, source_url, evidence_notes, confidence_score, is_sample, created_by_user_id)
    values
      (v_project_id, nullif(v_item->>'unit_reference',''), nullif(v_item->>'tower_name',''),
       nullif(v_item->>'floor_number','')::integer, nullif(v_item->>'configuration',''),
       nullif(v_item->>'carpet_area_sqft','')::numeric, nullif(v_item->>'asking_price_inr','')::numeric,
       nullif(v_item->>'additional_charges_inr','')::numeric,
       case when v_item->>'availability_status' in ('available','on_hold','booked','sold','rented','unavailable','unknown')
         then v_item->>'availability_status' else 'unknown' end,
       case when v_item->>'market_type' in ('primary','resale','rental') then v_item->>'market_type' else 'primary' end,
       nullif(v_item->>'source_url',''), nullif(v_item->>'evidence_notes',''), null, false, v_uid);
  end loop;
  return v_project_id;
end
$function$;

revoke all on function public.submit_builder_project(text,text,text,text,text,uuid,uuid,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.submit_builder_project(text,text,text,text,text,uuid,uuid,text,text,text,text,text,jsonb) to authenticated;
