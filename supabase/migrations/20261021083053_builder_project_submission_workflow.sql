create or replace function public.submit_builder_project(
  p_registered_name text, p_brand text, p_website_url text, p_public_address text,
  p_public_phone text, p_rera_registration text, p_city_id uuid, p_locality_id uuid,
  p_project_name text, p_project_address text, p_official_url text, p_brochure_url text,
  p_project_category text, p_construction_status text, p_configurations jsonb,
  p_total_units integer, p_expected_possession date, p_price_min numeric, p_price_max numeric,
  p_unit_configuration text, p_unit_reference text, p_unit_area numeric, p_unit_price numeric,
  p_unit_source_url text
) returns jsonb
language plpgsql security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_city_name text;
  v_developer_id uuid;
  v_project_id uuid;
begin
  if v_user is null then raise exception 'Sign in to submit a project'; end if;
  if not exists (select 1 from public.profiles where id=v_user and role::text='builder') then raise exception 'Builder account required'; end if;
  if char_length(trim(coalesce(p_registered_name,''))) < 2 then raise exception 'Enter the registered developer or company name'; end if;
  if char_length(trim(coalesce(p_project_name,''))) < 3 then raise exception 'Enter the project name'; end if;
  if p_city_id is null or not exists (select 1 from public.cities where id=p_city_id and is_active) then raise exception 'Choose an active city'; end if;
  if p_locality_id is not null and not exists(select 1 from public.localities where id=p_locality_id and city_id=p_city_id) then raise exception 'Choose a locality in the selected city'; end if;
  if coalesce(p_official_url,'') !~* '^https?://' then raise exception 'Enter the official project URL'; end if;
  if coalesce(p_website_url,'') !~* '^https?://' then raise exception 'Enter the developer website'; end if;
  if p_project_category not in ('residential','commercial','plotted','mixed_use','industrial','other') then raise exception 'Choose a valid project category'; end if;
  if p_construction_status not in ('upcoming','under_construction','completed','on_hold','cancelled','unknown') then raise exception 'Choose a valid construction status'; end if;
  if p_total_units is not null and p_total_units < 0 then raise exception 'Total units cannot be negative'; end if;
  if p_price_min is not null and p_price_min <= 0 then raise exception 'Minimum price must be greater than zero'; end if;
  if p_price_max is not null and p_price_max <= 0 then raise exception 'Maximum price must be greater than zero'; end if;
  if p_price_min is not null and p_price_max is not null and p_price_max < p_price_min then raise exception 'Maximum price must be greater than or equal to minimum price'; end if;
  if p_unit_configuration is not null and (p_unit_source_url is null or p_unit_source_url !~* '^https?://') then raise exception 'Add the source URL for the submitted unit reference'; end if;
  if p_unit_area is not null and p_unit_area <= 0 then raise exception 'Unit carpet area must be greater than zero'; end if;
  if p_unit_price is not null and p_unit_price <= 0 then raise exception 'Unit price must be greater than zero'; end if;
  select name into v_city_name from public.cities where id=p_city_id;
  insert into public.developers (registered_name,operating_brand,website_url,public_business_address,public_phone,rera_registration,city_id,operating_cities,verification_status,is_sample,created_by_user_id)
  values (trim(p_registered_name),nullif(trim(coalesce(p_brand,'')),''),trim(p_website_url),nullif(trim(coalesce(p_public_address,'')),''),nullif(trim(coalesce(p_public_phone,'')),''),nullif(trim(coalesce(p_rera_registration,'')),''),p_city_id,array[v_city_name],'pending',false,v_user)
  returning id into v_developer_id;
  insert into public.real_estate_projects (developer_id,official_name,city_id,locality_id,public_address,rera_number,project_category,construction_status,expected_possession_date,total_units,configurations,published_price_min_inr,published_price_max_inr,official_project_url,brochure_url,inventory_status,verification_status,confidence_score,is_sample,created_by_user_id)
  values (v_developer_id,trim(p_project_name),p_city_id,p_locality_id,nullif(trim(coalesce(p_project_address,'')),''),nullif(trim(coalesce(p_rera_registration,'')),''),p_project_category,p_construction_status,p_expected_possession,p_total_units,coalesce(p_configurations,'[]'::jsonb),p_price_min,p_price_max,trim(p_official_url),nullif(trim(coalesce(p_brochure_url,'')),''),'advertised_unverified','pending',null,false,v_user)
  returning id into v_project_id;
  if nullif(trim(coalesce(p_unit_configuration,'')),'') is not null then
    insert into public.project_inventory_observations (project_id,unit_reference,configuration,carpet_area_sqft,asking_price_inr,availability_status,market_type,source_url,observed_at,verified_by,evidence_notes,confidence_score,is_sample,created_by_user_id)
    values (v_project_id,nullif(trim(coalesce(p_unit_reference,'')),''),trim(p_unit_configuration),p_unit_area,p_unit_price,'unknown','primary',trim(p_unit_source_url),now(),null,'Builder submitted reference; availability not independently verified.',null,false,v_user);
  end if;
  return jsonb_build_object('project_id',v_project_id,'developer_id',v_developer_id,'verification_status','pending');
end;
$$;
revoke all on function public.submit_builder_project(text,text,text,text,text,text,uuid,uuid,text,text,text,text,text,text,jsonb,integer,date,numeric,numeric,text,text,numeric,numeric,text) from public, anon;
grant execute on function public.submit_builder_project(text,text,text,text,text,text,uuid,uuid,text,text,text,text,text,text,jsonb,integer,date,numeric,numeric,text,text,numeric,numeric,text) to authenticated;
