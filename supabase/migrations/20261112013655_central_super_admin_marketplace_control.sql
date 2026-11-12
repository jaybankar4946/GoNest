-- GoNest: Central Super Admin marketplace control
-- Additive only. Reuses profiles / developers / real_estate_projects / listings /
-- listing_images / project_inventory_observations / admin_audit_log.
-- Existing is_admin() policies are untouched; this adds a Super Admin / Staff split,
-- least-privilege guards for Staff, visibility controls and field-level audit.

-- 1. Columns ---------------------------------------------------------------
alter table public.profiles
  add column if not exists admin_level text,
  add column if not exists account_status text not null default 'active',
  add column if not exists featured boolean not null default false,
  add column if not exists directory_visible boolean not null default true,
  add column if not exists gallery_urls text[] not null default '{}';

alter table public.developers
  add column if not exists is_active boolean not null default true,
  add column if not exists featured boolean not null default false,
  add column if not exists logo_url text,
  add column if not exists gallery_image_urls text[] not null default '{}';

alter table public.real_estate_projects
  add column if not exists featured boolean not null default false,
  add column if not exists lifecycle_status text not null default 'published',
  add column if not exists description text,
  add column if not exists amenities text[] not null default '{}';

alter table public.project_inventory_observations
  add column if not exists photo_urls text[] not null default '{}',
  add column if not exists document_urls text[] not null default '{}';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_admin_level_check') then
    alter table public.profiles add constraint profiles_admin_level_check check (admin_level in ('super','staff'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_account_status_check') then
    alter table public.profiles add constraint profiles_account_status_check check (account_status in ('active','suspended','deactivated'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'real_estate_projects_lifecycle_status_check') then
    alter table public.real_estate_projects add constraint real_estate_projects_lifecycle_status_check check (lifecycle_status in ('published','unpublished','archived'));
  end if;
end $$;

-- 2. Existing administrator becomes Super Admin (identity is the Supabase Auth uid
--    stored in profiles.id; nothing is derived from name or e-mail). ----------------
update public.profiles set admin_level = 'super' where role = 'admin' and admin_level is null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_admin_level_matches_role') then
    alter table public.profiles add constraint profiles_admin_level_matches_role
      check ((role = 'admin' and admin_level is not null) or (role <> 'admin' and admin_level is null));
  end if;
end $$;

-- 3. Staff permission model ---------------------------------------------------
create table if not exists public.admin_staff_permissions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  modules text[] not null default '{}',
  can_edit boolean not null default false,
  can_publish boolean not null default false,
  can_delete boolean not null default false,
  granted_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.admin_staff_permissions enable row level security;
revoke all on public.admin_staff_permissions from anon;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = pg_catalog, public, pg_temp as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and admin_level = 'super');
$$;

-- An administrator that is not explicitly 'super' is treated as Staff (least privilege).
create or replace function public.is_staff_admin() returns boolean
language sql stable security definer set search_path = pg_catalog, public, pg_temp as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and admin_level is distinct from 'super');
$$;

create or replace function public.has_admin_permission(p_module text, p_action text default 'edit') returns boolean
language sql stable security definer set search_path = pg_catalog, public, pg_temp as $$
  select public.is_super_admin() or exists (
    select 1 from public.admin_staff_permissions s join public.profiles p on p.id = s.user_id
    where s.user_id = auth.uid() and p.role = 'admin' and p_module = any (s.modules)
      and case p_action when 'view' then true when 'edit' then s.can_edit when 'publish' then s.can_publish when 'delete' then s.can_delete else false end);
$$;

create or replace function public.is_account_active() returns boolean
language sql stable security definer set search_path = pg_catalog, public, pg_temp as $$
  select not exists (select 1 from public.profiles where id = auth.uid() and account_status <> 'active');
$$;

grant execute on function public.is_super_admin(), public.is_staff_admin(), public.has_admin_permission(text, text), public.is_account_active() to anon, authenticated;

drop policy if exists staff_permissions_select on public.admin_staff_permissions;
create policy staff_permissions_select on public.admin_staff_permissions for select to authenticated
  using (public.is_super_admin() or user_id = auth.uid());
drop policy if exists staff_permissions_super_write on public.admin_staff_permissions;
create policy staff_permissions_super_write on public.admin_staff_permissions for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
grant select, insert, update, delete on public.admin_staff_permissions to authenticated;

-- 4. Staff write guards (restrictive => ANDed with existing policies; no effect on
--    Super Admin or ordinary users) --------------------------------------------------
do $$
declare t record;
begin
  for t in select * from (values
    ('listings',                       'case when {r}.purpose = ''sale'' then ''buy'' else ''rent'' end'),
    ('listing_images',                 '''media'''),
    ('developers',                     '''builders'''),
    ('real_estate_projects',           '''projects'''),
    ('project_inventory_observations', '''inventory''')
  ) as v(tbl, modexpr) loop
    execute format('drop policy if exists staff_guard_insert on public.%I', t.tbl);
    execute format('drop policy if exists staff_guard_update on public.%I', t.tbl);
    execute format('drop policy if exists staff_guard_delete on public.%I', t.tbl);
    execute format('create policy staff_guard_insert on public.%I as restrictive for insert to public with check (not public.is_staff_admin() or public.has_admin_permission(%s, ''edit''))', t.tbl, replace(t.modexpr, '{r}', t.tbl));
    execute format('create policy staff_guard_update on public.%I as restrictive for update to public using (not public.is_staff_admin() or public.has_admin_permission(%s, ''edit'')) with check (not public.is_staff_admin() or public.has_admin_permission(%s, ''edit''))', t.tbl, replace(t.modexpr, '{r}', t.tbl), replace(t.modexpr, '{r}', t.tbl));
    execute format('create policy staff_guard_delete on public.%I as restrictive for delete to public using (not public.is_staff_admin() or public.has_admin_permission(%s, ''delete''))', t.tbl, replace(t.modexpr, '{r}', t.tbl));
  end loop;
end $$;

-- listing_images has no purpose column; its guard uses the 'media' module (set above).
-- profiles: Staff need agents, owners or users module access to edit another profile.
drop policy if exists staff_guard_update on public.profiles;
create policy staff_guard_update on public.profiles as restrictive for update to public
  using (not public.is_staff_admin() or id = auth.uid()
         or public.has_admin_permission('users', 'edit') or public.has_admin_permission('agents', 'edit') or public.has_admin_permission('owners', 'edit'))
  with check (not public.is_staff_admin() or id = auth.uid()
         or public.has_admin_permission('users', 'edit') or public.has_admin_permission('agents', 'edit') or public.has_admin_permission('owners', 'edit'));

-- Suspended / deactivated accounts cannot create or change listings.
drop policy if exists active_account_insert on public.listings;
drop policy if exists active_account_update on public.listings;
create policy active_account_insert on public.listings as restrictive for insert to public with check (public.is_account_active() or public.is_admin());
create policy active_account_update on public.listings as restrictive for update to public using (public.is_account_active() or public.is_admin()) with check (public.is_account_active() or public.is_admin());

-- Staff storage guard for the public media bucket the admin UI writes to.
drop policy if exists staff_guard_listing_images_insert on storage.objects;
drop policy if exists staff_guard_listing_images_update on storage.objects;
drop policy if exists staff_guard_listing_images_delete on storage.objects;
create policy staff_guard_listing_images_insert on storage.objects as restrictive for insert to public
  with check (bucket_id <> 'listing-images' or not public.is_staff_admin() or public.has_admin_permission('media', 'edit'));
create policy staff_guard_listing_images_update on storage.objects as restrictive for update to public
  using (bucket_id <> 'listing-images' or not public.is_staff_admin() or public.has_admin_permission('media', 'edit'));
create policy staff_guard_listing_images_delete on storage.objects as restrictive for delete to public
  using (bucket_id <> 'listing-images' or not public.is_staff_admin() or public.has_admin_permission('media', 'delete'));

-- 5. Publish / verify / feature rights for Staff (column level) --------------------
create or replace function public.guard_staff_publish() returns trigger
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $$
declare
  m text := tg_argv[0]; c text; i int;
  o jsonb := to_jsonb(old); n jsonb := to_jsonb(new);
begin
  if auth.uid() is null or not public.is_staff_admin() then return new; end if;
  if tg_table_name = 'listings' then m := case when new.purpose = 'sale' then 'buy' else 'rent' end;
  elsif tg_table_name = 'profiles' then m := case old.role when 'agent' then 'agents' when 'owner' then 'owners' else 'users' end;
  end if;
  for i in 1 .. coalesce(array_length(tg_argv, 1), 0) - 1 loop
    c := tg_argv[i];
    if (o -> c) is distinct from (n -> c) and not public.has_admin_permission(m, 'publish') then
      raise exception 'Your Admin Staff role cannot change "%" on % (module "%" needs the publish permission)', c, tg_table_name, m using errcode = '42501';
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists b_guard_staff_publish on public.listings;
create trigger b_guard_staff_publish before update on public.listings for each row
  execute function public.guard_staff_publish('listings','status','featured','verified','verification_level','rejection_reason');
drop trigger if exists b_guard_staff_publish on public.profiles;
create trigger b_guard_staff_publish before update on public.profiles for each row
  execute function public.guard_staff_publish('profiles','agent_verified','builder_verified','account_status','featured','directory_visible');
drop trigger if exists b_guard_staff_publish on public.developers;
create trigger b_guard_staff_publish before update on public.developers for each row
  execute function public.guard_staff_publish('builders','verification_status','is_active','featured');
drop trigger if exists b_guard_staff_publish on public.real_estate_projects;
create trigger b_guard_staff_publish before update on public.real_estate_projects for each row
  execute function public.guard_staff_publish('projects','verification_status','lifecycle_status','featured');
drop trigger if exists b_guard_staff_publish on public.project_inventory_observations;
create trigger b_guard_staff_publish before update on public.project_inventory_observations for each row
  execute function public.guard_staff_publish('inventory','review_status','availability_status');

-- 6. Privilege-escalation + last-Super-Admin guard ---------------------------------
create or replace function public.guard_profile_privileges() returns trigger
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $$
declare other_supers int;
begin
  if tg_op = 'DELETE' then
    if auth.uid() is not null and old.role = 'admin' and old.admin_level = 'super' then
      select count(*) into other_supers from public.profiles where role = 'admin' and admin_level = 'super' and id <> old.id;
      if other_supers = 0 then raise exception 'The last Super Admin cannot be removed' using errcode = '42501'; end if;
    end if;
    return old;
  end if;

  -- normalisation (applies to every caller so the table constraint always holds)
  if new.role = 'admin' and new.admin_level is null then new.admin_level := 'staff'; end if;
  if new.role <> 'admin' then new.admin_level := null; end if;

  if auth.uid() is null then return new; end if;   -- service role / SQL editor / migrations

  if (new.role is distinct from old.role or new.admin_level is distinct from old.admin_level)
     and (new.role = 'admin' or old.role = 'admin') then
    if not public.is_super_admin() then
      raise exception 'Only a Super Admin can grant, change or remove administrator access' using errcode = '42501';
    end if;
    if auth.uid() = old.id then
      raise exception 'You cannot change your own administrator role or level' using errcode = '42501';
    end if;
    if old.role = 'admin' and old.admin_level = 'super' and (new.role <> 'admin' or new.admin_level is distinct from 'super') then
      select count(*) into other_supers from public.profiles where role = 'admin' and admin_level = 'super' and id <> old.id;
      if other_supers = 0 then raise exception 'The last Super Admin cannot be demoted' using errcode = '42501'; end if;
    end if;
  end if;

  if not public.is_admin() and (new.account_status is distinct from old.account_status
       or new.featured is distinct from old.featured or new.directory_visible is distinct from old.directory_visible) then
    raise exception 'Only administrators can change account status, featured or directory visibility' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists a_guard_profile_privileges on public.profiles;
create trigger a_guard_profile_privileges before update or delete on public.profiles for each row
  execute function public.guard_profile_privileges();

-- Staff permission rows can only be written by a Super Admin (RLS) and never for self-escalation.
-- 7. Field-level audit for administrator actions (reuses admin_audit_log) -----------
create or replace function public.audit_admin_field_changes() returns trigger
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $$
declare
  diff jsonb; rid uuid; rec jsonb := to_jsonb(coalesce(new, old));
begin
  if auth.uid() is null or not public.is_admin() then return null; end if;
  rid := coalesce(rec ->> 'id', rec ->> 'user_id')::uuid;
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(o.key, jsonb_build_array(o.value, n.value)) into diff
    from jsonb_each(to_jsonb(old)) o join jsonb_each(to_jsonb(new)) n using (key)
    where o.value is distinct from n.value and o.key not in ('updated_at','view_count','lead_count','saved_count');
    if diff is null then return null; end if;
    insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, details)
      values (auth.uid(), 'field_update', tg_table_name, rid, jsonb_build_object('changes', diff));
  elsif tg_op = 'INSERT' then
    insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, details)
      values (auth.uid(), 'record_create', tg_table_name, rid, jsonb_build_object('record', rec));
  else
    insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, details)
      values (auth.uid(), 'record_delete', tg_table_name, rid, jsonb_build_object('record', rec));
  end if;
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','listings','listing_images','developers','real_estate_projects','project_inventory_observations','project_media','admin_staff_permissions'] loop
    execute format('drop trigger if exists z_audit_admin_fields on public.%I', t);
    execute format('create trigger z_audit_admin_fields after insert or update or delete on public.%I for each row execute function public.audit_admin_field_changes()', t);
  end loop;
end $$;

-- 8. Public visibility honours the new controls (defaults keep current behaviour) -----
alter policy profiles_select_public_directory on public.profiles
  using (role = any (array['agent'::user_role, 'owner'::user_role]) and is_sample = false and directory_visible and account_status = 'active');
alter policy public_read_sourced_developers on public.developers
  using (is_sample = false and website_url is not null and is_active
         and (verification_status = 'verified' or (created_by_user_id is null and verification_status = 'pending')));
alter policy public_read_sourced_projects on public.real_estate_projects
  using (is_sample = false and official_project_url is not null and lifecycle_status = 'published'
         and (verification_status = 'verified' or (created_by_user_id is null and verification_status = 'pending')));

-- 9. Admin may manage builder-submitted project media rows as well ------------------
drop policy if exists project_media_admin_write on public.project_media;
create policy project_media_admin_write on public.project_media for all to authenticated
  using (public.is_admin() and public.has_admin_permission('media', 'edit'))
  with check (public.is_admin() and public.has_admin_permission('media', 'edit'));

-- 10. Server-side admin API (SECURITY DEFINER, allow-listed columns) ------------------
-- The database uses column-level grants for `authenticated`, so the browser cannot (and
-- must not) be given blanket UPDATE rights. Every admin read/write goes through these
-- functions, which verify is_admin() + module permission, restrict columns to an
-- allow-list and leave audit/guard triggers active (auth.uid() is still the actor).
create or replace function public.admin_entity_config(p_entity text) returns jsonb
language sql immutable set search_path = pg_catalog, public as $cfg$
  select case p_entity
    when 'agents' then jsonb_build_object('table','profiles','module','agents','base',$x$t.role = 'agent'$x$,'order','t.created_at desc','updated_at',true,
      'search',to_jsonb(array['full_name','agency_name','email','phone','rera_number']),
      'filters',to_jsonb(array['agent_verified','account_status','featured','directory_visible']),
      'editable',to_jsonb(array['full_name','phone','email','agency_name','rera_number','agent_verified','phone_verified','avatar_url','bio','service_localities','service_pincodes','account_status','featured','directory_visible','gallery_urls']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('listing_count',(select count(*) from public.listings l where l.posted_by = t.id))$x$)
    when 'owners' then jsonb_build_object('table','profiles','module','owners','base',$x$t.role = 'owner'$x$,'order','t.created_at desc','updated_at',true,
      'search',to_jsonb(array['full_name','email','phone']),
      'filters',to_jsonb(array['account_status','featured','directory_visible']),
      'editable',to_jsonb(array['full_name','phone','email','avatar_url','bio','phone_verified','account_status','featured','directory_visible','gallery_urls']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('listing_count',(select count(*) from public.listings l where l.posted_by = t.id))$x$)
    when 'users' then jsonb_build_object('table','profiles','module','users','base','true','order','t.created_at desc','updated_at',true,
      'search',to_jsonb(array['full_name','email','phone','agency_name']),
      'filters',to_jsonb(array['role','admin_level','account_status','agent_verified','builder_verified']),
      'editable',to_jsonb(array['full_name','phone','email','agency_name','rera_number','agent_verified','builder_verified','phone_verified','avatar_url','bio','account_status','featured','directory_visible']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('listing_count',(select count(*) from public.listings l where l.posted_by = t.id), 'staff', (select to_jsonb(s) from public.admin_staff_permissions s where s.user_id = t.id))$x$)
    when 'builders' then jsonb_build_object('table','developers','module','builders','base','true','order','t.updated_at desc','updated_at',true,
      'search',to_jsonb(array['registered_name','operating_brand','website_url','rera_registration','public_phone']),
      'filters',to_jsonb(array['verification_status','is_active','featured']),
      'editable',to_jsonb(array['registered_name','operating_brand','website_url','public_business_address','public_phone','public_enquiry_url','city_id','rera_registration','operating_cities','verification_status','is_active','featured','logo_url','gallery_image_urls']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('project_count',(select count(*) from public.real_estate_projects p where p.developer_id = t.id))$x$)
    when 'projects' then jsonb_build_object('table','real_estate_projects','module','projects','base','true','order','t.updated_at desc','updated_at',true,
      'search',to_jsonb(array['official_name','public_address','rera_number','pincode','landmark','neighbourhood']),
      'filters',to_jsonb(array['verification_status','lifecycle_status','construction_status','inventory_status','featured','developer_id']),
      'editable',to_jsonb(array['official_name','alternate_names','developer_id','city_id','locality_id','public_address','latitude','longitude','pincode','landmark','neighbourhood','rera_number','project_category','construction_status','launch_date','expected_possession_date','total_units','configurations','published_price_min_inr','published_price_max_inr','official_project_url','brochure_url','inventory_status','verification_status','cover_image_url','gallery_image_urls','image_source_url','rera_source_url','featured','lifecycle_status','description','amenities']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('developer_name',(select coalesce(d.operating_brand, d.registered_name) from public.developers d where d.id = t.developer_id),'city_name',(select c.name from public.cities c where c.id = t.city_id),'locality_name',(select l.name from public.localities l where l.id = t.locality_id),'unit_count',(select count(*) from public.project_inventory_observations u where u.project_id = t.id))$x$)
    when 'buy' then jsonb_build_object('table','listings','module','buy','base',$x$t.purpose = 'sale'$x$,'order','t.updated_at desc','updated_at',false,
      'search',to_jsonb(array['title','address_line','pincode','landmark','neighbourhood','slug']),
      'filters',to_jsonb(array['status','verification_level','featured','property_type','poster_type','city_id']),
      'editable',to_jsonb(array['title','description','property_type','city_id','locality_id','address_line','landmark','neighbourhood','pincode','latitude','longitude','price','price_negotiable','maintenance_monthly','security_deposit','bedrooms','bathrooms','balconies','sqft','carpet_area','floor_number','total_floors','furnishing','property_age','facing','available_from','brokerage','amenities','video_url','availability','featured','expires_at']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('city_name',(select c.name from public.cities c where c.id = t.city_id),'locality_name',(select l.name from public.localities l where l.id = t.locality_id),'poster_name',(select p.full_name from public.profiles p where p.id = t.posted_by),'image_count',(select count(*) from public.listing_images i where i.listing_id = t.id))$x$)
    when 'rent' then jsonb_build_object('table','listings','module','rent','base',$x$t.purpose = 'rent'$x$,'order','t.updated_at desc','updated_at',false,
      'search',to_jsonb(array['title','address_line','pincode','landmark','neighbourhood','slug']),
      'filters',to_jsonb(array['status','verification_level','featured','property_type','poster_type','city_id']),
      'editable',to_jsonb(array['title','description','property_type','city_id','locality_id','address_line','landmark','neighbourhood','pincode','latitude','longitude','price','price_negotiable','maintenance_monthly','security_deposit','bedrooms','bathrooms','balconies','sqft','carpet_area','floor_number','total_floors','furnishing','property_age','facing','available_from','brokerage','amenities','video_url','availability','featured','expires_at']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('city_name',(select c.name from public.cities c where c.id = t.city_id),'locality_name',(select l.name from public.localities l where l.id = t.locality_id),'poster_name',(select p.full_name from public.profiles p where p.id = t.posted_by),'image_count',(select count(*) from public.listing_images i where i.listing_id = t.id))$x$)
    when 'inventory' then jsonb_build_object('table','project_inventory_observations','module','inventory','base','true','order','t.observed_at desc','updated_at',false,
      'search',to_jsonb(array['unit_reference','tower_name','configuration']),
      'filters',to_jsonb(array['availability_status','review_status','market_type','project_id']),
      'editable',to_jsonb(array['unit_reference','tower_name','floor_number','configuration','carpet_area_sqft','asking_price_inr','additional_charges_inr','availability_status','market_type','source_url','evidence_notes','photo_urls','document_urls']),
      'extra',$x$to_jsonb(t) || jsonb_build_object('project_name',(select p.official_name from public.real_estate_projects p where p.id = t.project_id),'developer_name',(select coalesce(d.operating_brand, d.registered_name) from public.real_estate_projects p join public.developers d on d.id = p.developer_id where p.id = t.project_id))$x$)
    else null end;
$cfg$;

create or replace function public.admin_list_records(p_entity text, p_search text default null, p_filters jsonb default '{}'::jsonb,
  p_limit int default 25, p_offset int default 0, p_id uuid default null) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $fn$
declare cfg jsonb := public.admin_entity_config(p_entity); w text; k text; v text; col text; parts text[] := '{}'; total bigint; res jsonb;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  if cfg is null then raise exception 'Unknown entity %', p_entity; end if;
  if not public.has_admin_permission(cfg ->> 'module', 'view') then raise exception 'Your account has no access to the "%" module', cfg ->> 'module' using errcode = '42501'; end if;
  w := coalesce(cfg ->> 'base', 'true');
  if p_id is not null then
    w := w || format(' and t.id = %L::uuid', p_id);
  else
    v := coalesce(p_filters ->> 'is_sample', 'false');
    if v = 'true' then w := w || ' and t.is_sample = true'; elsif v <> 'any' then w := w || ' and t.is_sample = false'; end if;
    for k in select jsonb_object_keys(coalesce(p_filters, '{}'::jsonb)) loop
      v := p_filters ->> k;
      if k <> 'is_sample' and nullif(v, '') is not null and (cfg -> 'filters') ? k then
        w := w || format(' and t.%I::text = %L', k, v);
      end if;
    end loop;
    if nullif(trim(coalesce(p_search, '')), '') is not null then
      parts := array[format('t.id::text ilike %L', '%' || trim(p_search) || '%')];
      for col in select jsonb_array_elements_text(cfg -> 'search') loop
        parts := parts || format('t.%I::text ilike %L', col, '%' || trim(p_search) || '%');
      end loop;
      w := w || ' and (' || array_to_string(parts, ' or ') || ')';
    end if;
  end if;
  execute format('select count(*) from public.%I t where %s', cfg ->> 'table', w) into total;
  execute format('select coalesce(jsonb_agg(x.r), ''[]''::jsonb) from (select %s as r from public.%I t where %s order by %s limit %s offset %s) x',
    cfg ->> 'extra', cfg ->> 'table', w, cfg ->> 'order', least(greatest(coalesce(p_limit, 25), 1), 100), greatest(coalesce(p_offset, 0), 0)) into res;
  return jsonb_build_object('total', total, 'rows', res);
end $fn$;

create or replace function public.admin_update_record(p_entity text, p_id uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $fn$
declare cfg jsonb := public.admin_entity_config(p_entity); tbl text; module text; k text; sets text := ''; row_out jsonb; target_role text; target_purpose text;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  if cfg is null then raise exception 'Unknown entity %', p_entity; end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then raise exception 'No changes were supplied'; end if;
  tbl := cfg ->> 'table'; module := cfg ->> 'module';
  if tbl = 'profiles' then
    select role::text into target_role from public.profiles where id = p_id;
    if target_role is null then raise exception 'Record not found'; end if;
    module := case target_role when 'agent' then 'agents' when 'owner' then 'owners' else 'users' end;
    if target_role = 'admin' and p_id <> auth.uid() and not public.is_super_admin() then
      raise exception 'Only a Super Admin can edit another administrator' using errcode = '42501';
    end if;
  elsif tbl = 'listings' then
    select purpose::text into target_purpose from public.listings where id = p_id;
    if target_purpose is null then raise exception 'Record not found'; end if;
    module := case target_purpose when 'sale' then 'buy' else 'rent' end;
  end if;
  if not public.has_admin_permission(module, 'edit') then
    raise exception 'Your account cannot edit records in the "%" module', module using errcode = '42501';
  end if;
  for k in select jsonb_object_keys(p_patch) loop
    if not ((cfg -> 'editable') ? k) then raise exception 'Field "%" cannot be changed from the admin dashboard', k using errcode = '42501'; end if;
    sets := sets || case when sets = '' then '' else ', ' end || format('%I = r.%I', k, k);
  end loop;
  if (cfg ->> 'updated_at')::boolean then sets := sets || ', updated_at = now()'; end if;
  execute format('update public.%I t set %s from (select * from jsonb_populate_record(null::public.%I, $1)) r where t.id = $2 returning to_jsonb(t.*)', tbl, sets, tbl)
    into row_out using p_patch, p_id;
  if row_out is null then raise exception 'Record not found or not updatable'; end if;
  return row_out;
end $fn$;

create or replace function public.admin_delete_listing(p_id uuid) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $fn$
declare module text; paths text[];
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  select case purpose when 'sale' then 'buy' else 'rent' end into module from public.listings where id = p_id;
  if module is null then raise exception 'Listing not found'; end if;
  if not public.has_admin_permission(module, 'delete') then raise exception 'Your account cannot delete in the "%" module', module using errcode = '42501'; end if;
  select coalesce(array_agg(storage_path), '{}') into paths from public.listing_images where listing_id = p_id;
  delete from public.listings where id = p_id;
  return jsonb_build_object('deleted', p_id, 'storage_paths', to_jsonb(paths));
end $fn$;

create or replace function public.admin_set_user_role(p_id uuid, p_role text, p_admin_level text default null) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $fn$
declare old_role text; row_out jsonb;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  if p_role not in ('buyer','owner','agent','builder','admin') then raise exception 'Unknown role %', p_role; end if;
  if p_admin_level is not null and p_admin_level not in ('super','staff') then raise exception 'Unknown admin level %', p_admin_level; end if;
  select role::text into old_role from public.profiles where id = p_id;
  if old_role is null then raise exception 'User not found'; end if;
  if p_role = 'admin' or old_role = 'admin' then
    if not public.is_super_admin() then raise exception 'Only a Super Admin can grant, change or remove administrator access' using errcode = '42501'; end if;
  elsif not public.has_admin_permission('users', 'edit') then
    raise exception 'Your account cannot change roles' using errcode = '42501';
  end if;
  update public.profiles set role = p_role::user_role, admin_level = case when p_role = 'admin' then coalesce(p_admin_level, 'staff') else null end, updated_at = now() where id = p_id returning to_jsonb(profiles.*) into row_out;
  if p_role <> 'admin' then delete from public.admin_staff_permissions where user_id = p_id; end if;
  return row_out;
end $fn$;

create or replace function public.admin_set_staff_permissions(p_user uuid, p_modules text[], p_can_edit boolean, p_can_publish boolean, p_can_delete boolean) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $fn$
declare m text; row_out jsonb; allowed text[] := array['agents','owners','builders','projects','buy','rent','inventory','media','verification','users','audit'];
begin
  if not public.is_super_admin() then raise exception 'Only a Super Admin can assign staff permissions' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles where id = p_user and role = 'admin' and admin_level = 'staff') then raise exception 'Permissions can only be assigned to Admin Staff accounts'; end if;
  foreach m in array coalesce(p_modules, '{}') loop
    if not (m = any (allowed)) then raise exception 'Unknown module %', m; end if;
  end loop;
  insert into public.admin_staff_permissions (user_id, modules, can_edit, can_publish, can_delete, granted_by, updated_at)
    values (p_user, coalesce(p_modules, '{}'), p_can_edit, p_can_publish, p_can_delete, auth.uid(), now())
    on conflict (user_id) do update set modules = excluded.modules, can_edit = excluded.can_edit, can_publish = excluded.can_publish,
      can_delete = excluded.can_delete, granted_by = excluded.granted_by, updated_at = now()
    returning to_jsonb(admin_staff_permissions.*) into row_out;
  return row_out;
end $fn$;

create or replace function public.admin_list_audit(p_search text default null, p_entity_type text default null, p_limit int default 50, p_offset int default 0) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, pg_temp as $fn$
declare total bigint; res jsonb; q text := '%' || coalesce(trim(p_search), '') || '%';
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  if not public.has_admin_permission('audit', 'view') then raise exception 'Your account has no access to the audit log' using errcode = '42501'; end if;
  select count(*) into total from public.admin_audit_log a left join public.profiles p on p.id = a.actor_id
    where (nullif(p_entity_type, '') is null or a.entity_type = p_entity_type)
      and (nullif(trim(coalesce(p_search, '')), '') is null or a.action ilike q or a.entity_id::text ilike q or a.details::text ilike q or coalesce(p.full_name, '') ilike q);
  select coalesce(jsonb_agg(x.r), '[]'::jsonb) into res from (
    select jsonb_build_object('id', a.id, 'created_at', a.created_at, 'action', a.action, 'entity_type', a.entity_type, 'entity_id', a.entity_id, 'details', a.details, 'actor_id', a.actor_id, 'actor_name', coalesce(p.full_name, p.email, a.actor_id::text)) as r
    from public.admin_audit_log a left join public.profiles p on p.id = a.actor_id
    where (nullif(p_entity_type, '') is null or a.entity_type = p_entity_type)
      and (nullif(trim(coalesce(p_search, '')), '') is null or a.action ilike q or a.entity_id::text ilike q or a.details::text ilike q or coalesce(p.full_name, '') ilike q)
    order by a.created_at desc limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0)) x;
  return jsonb_build_object('total', total, 'rows', res);
end $fn$;

create or replace function public.admin_my_access() returns jsonb
language sql stable security definer set search_path = pg_catalog, public, pg_temp as $fn$
  select case when not public.is_admin() then jsonb_build_object('is_admin', false)
    else jsonb_build_object('is_admin', true, 'is_super', public.is_super_admin(),
      'permissions', (select to_jsonb(s) - 'user_id' - 'granted_by' from public.admin_staff_permissions s where s.user_id = auth.uid())) end;
$fn$;

do $$ declare f text; begin
  foreach f in array array['admin_list_records(text,text,jsonb,int,int,uuid)','admin_update_record(text,uuid,jsonb)','admin_delete_listing(uuid)',
    'admin_set_user_role(uuid,text,text)','admin_set_staff_permissions(uuid,text[],boolean,boolean,boolean)','admin_list_audit(text,text,int,int)','admin_my_access()','admin_entity_config(text)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
