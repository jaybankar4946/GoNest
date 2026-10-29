-- Seed builder-provided Westgate project reference for the Hiranandani-only New Projects launch.
-- Details are pending review; this does not certify live unit availability or the developer's commercial claims.
with chosen_city as (
  select id, name from public.cities
  where lower(name) like '%thane%' or lower(name) like '%mumbai%'
  order by case when lower(name) like '%thane%' then 0 else 1 end
  limit 1
),
source_row as (
  insert into public.market_data_sources
    (source_name, source_category, source_url, access_method, permitted_use, license_status, redistribution_allowed, confidence_level, notes)
  values
    ('House of Hiranandani Westgate sales inventory supplied by user', 'authorized_partner',
     'https://cp.myhoh.in/sperto-cp/register', 'manual_review', 'research_only', 'review_required', false, 'medium',
     'User-provided sales-channel details and Westgate Phase I floor-plan PDF. CP registration URL is not a public project inventory feed; confirm redistribution permissions before publishing brochure imagery.')
  on conflict (source_name, source_url) do update set notes = excluded.notes
  returning id
),
developer_row as (
  insert into public.developers
    (registered_name, operating_brand, website_url, operating_cities, verification_status, source_id, source_url, source_checked_at, is_sample)
  select 'Shoden Developers Private Limited', 'House of Hiranandani', 'https://www.houseofhiranandani.com/',
         array['Thane','Mumbai'], 'pending', source_row.id, source_row.source_url, now(), false
  from source_row
  where not exists (
    select 1 from public.developers d
    where lower(coalesce(d.registered_name,'')) = lower('Shoden Developers Private Limited')
      and lower(coalesce(d.operating_brand,'')) = lower('House of Hiranandani')
  )
  returning id
),
existing_developer as (
  select id from public.developers
  where lower(coalesce(registered_name,'')) = lower('Shoden Developers Private Limited')
    and lower(coalesce(operating_brand,'')) = lower('House of Hiranandani')
  limit 1
),
chosen_developer as (
  select id from developer_row
  union all
  select id from existing_developer
  limit 1
)
insert into public.real_estate_projects
  (developer_id, official_name, alternate_names, city_id, locality_id, public_address, rera_number,
   project_category, construction_status, expected_possession_date, configurations,
   published_price_min_inr, published_price_max_inr, price_observed_at, price_source_id,
   official_project_url, inventory_status, verification_status, confidence_score, is_sample)
select
  chosen_developer.id,
  'Hiranandani Westgate Phase I',
  array['Westgate','Westgate Waghbil','Hiranandani Westgate'],
  chosen_city.id,
  (select l.id from public.localities l where lower(l.name) like '%waghbil%' limit 1),
  'Waghbil, Thane West, Maharashtra',
  'P51700077268',
  'residential',
  'upcoming',
  date '2031-10-31',
  jsonb_build_array(
    jsonb_build_object('label','2 BHK','tower','Florencia','floors','47 storeys','carpet_area_min_sqft',483,'carpet_area_max_sqft',728,'price_from_inr',13900000),
    jsonb_build_object('label','3 BHK','tower','Belvedere','floors','51 storeys','carpet_area_min_sqft',949,'carpet_area_max_sqft',1203,'price_from_inr',28200000),
    jsonb_build_object('label','4 BHK','tower','Somerset','floors','55 storeys','carpet_area_min_sqft',1535,'carpet_area_max_sqft',1662,'price_from_inr',54100000)
  ),
  13900000, 54100000, now(), source_row.id,
  'https://www.houseofhiranandani.com/',
  'unknown', 'pending', 0.650, false
from chosen_developer, chosen_city, source_row
where not exists (
  select 1 from public.real_estate_projects p
  where lower(p.official_name) = lower('Hiranandani Westgate Phase I')
);
