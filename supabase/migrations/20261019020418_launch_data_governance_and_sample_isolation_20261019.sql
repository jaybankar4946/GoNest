-- Migration 20261019020418_launch_data_governance_and_sample_isolation_20261019
-- Applied to production on 2026-10-19. Public roles intentionally have no direct access to governance tables.
alter table public.profiles add column if not exists is_sample boolean not null default false;
alter table public.leads add column if not exists is_sample boolean not null default false;
alter table public.notifications add column if not exists is_sample boolean not null default false;
alter table public.events add column if not exists is_sample boolean not null default false;

update public.leads l set is_sample=true
where exists(select 1 from public.listings p where p.id=l.listing_id and p.is_sample=true)
   or exists(select 1 from public.profiles p where p.id=l.buyer_id and p.is_sample=true);
update public.notifications n set is_sample=true
where exists(select 1 from public.profiles p where p.id=n.user_id and p.is_sample=true)
   or exists(select 1 from public.listings l where l.id=n.listing_id and l.is_sample=true);
update public.events e set is_sample=true
where exists(select 1 from public.profiles p where p.id=e.user_id and p.is_sample=true)
   or exists(select 1 from public.listings l where l.id=e.listing_id and l.is_sample=true);

drop policy if exists listings_select_public on public.listings;
create policy listings_select_public on public.listings for select to anon, authenticated
using ((status='active' and is_sample=false) or posted_by=(select auth.uid()) or public.is_admin());
drop policy if exists profiles_select_public_directory on public.profiles;
create policy profiles_select_public_directory on public.profiles for select to anon, authenticated
using (role in ('agent'::public.user_role,'owner'::public.user_role) and is_sample=false);
drop policy if exists listing_images_select_public on public.listing_images;
create policy listing_images_select_public on public.listing_images for select to anon, authenticated
using (exists(select 1 from public.listings l where l.id=listing_images.listing_id
and ((l.status='active' and l.is_sample=false) or l.posted_by=(select auth.uid()) or public.is_admin())));
revoke all on table public.events from anon, authenticated;
revoke all on table public.notification_outbox from anon, authenticated;

create table if not exists public.market_data_sources (
 id uuid primary key default gen_random_uuid(), source_name text not null,
 source_category text not null check(source_category in ('official_registry','developer','authorized_partner','public_portal','licensed_provider','internal','other')),
 source_url text, access_method text not null default 'manual_review', permitted_use text not null default 'research_only',
 license_status text not null default 'unknown' check(license_status in ('unknown','review_required','authorized','restricted','expired')),
 redistribution_allowed boolean not null default false, terms_url text,
 refresh_frequency_days integer check(refresh_frequency_days is null or refresh_frequency_days>0),
 last_checked_at timestamptz, confidence_level text not null default 'unverified' check(confidence_level in ('unverified','low','medium','high')),
 notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(source_name,source_url)
);
create table if not exists public.developers (
 id uuid primary key default gen_random_uuid(), registered_name text not null, operating_brand text, website_url text,
 public_business_address text, public_phone text, public_enquiry_url text, city_id uuid references public.cities(id),
 rera_registration text, operating_cities text[] not null default '{}',
 verification_status text not null default 'unverified' check(verification_status in ('unverified','pending','verified','rejected','stale')),
 source_id uuid references public.market_data_sources(id), source_url text, source_checked_at timestamptz,
 last_verified_at timestamptz, is_sample boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.real_estate_projects (
 id uuid primary key default gen_random_uuid(), developer_id uuid not null references public.developers(id) on delete restrict,
 official_name text not null, alternate_names text[] not null default '{}', city_id uuid not null references public.cities(id),
 locality_id uuid references public.localities(id), public_address text, latitude numeric(9,6), longitude numeric(9,6),
 rera_number text, project_category text not null default 'residential' check(project_category in ('residential','commercial','plotted','mixed_use','industrial','other')),
 construction_status text not null default 'unknown' check(construction_status in ('upcoming','under_construction','completed','on_hold','cancelled','unknown')),
 launch_date date, expected_possession_date date, total_units integer check(total_units is null or total_units>=0),
 configurations jsonb not null default '[]'::jsonb, published_price_min_inr numeric(14,2), published_price_max_inr numeric(14,2),
 price_observed_at timestamptz, price_source_id uuid references public.market_data_sources(id), official_project_url text, brochure_url text,
 inventory_status text not null default 'unknown' check(inventory_status in ('verified_available','advertised_unverified','sold_out','not_open_for_sale','unknown')),
 inventory_verified_at timestamptz, verification_status text not null default 'unverified' check(verification_status in ('unverified','pending','verified','rejected','stale','conflicting')),
 confidence_score numeric(4,3) check(confidence_score is null or confidence_score between 0 and 1),
 is_sample boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_inventory_observations (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.real_estate_projects(id) on delete restrict,
 unit_reference text, tower_name text, floor_number integer, configuration text, carpet_area_sqft numeric(10,2),
 asking_price_inr numeric(14,2), additional_charges_inr numeric(14,2),
 availability_status text not null default 'unknown' check(availability_status in ('available','on_hold','booked','sold','rented','unavailable','unknown')),
 market_type text not null default 'primary' check(market_type in ('primary','resale','rental')),
 source_id uuid references public.market_data_sources(id), source_url text, observed_at timestamptz not null default now(),
 verified_by text, evidence_notes text, confidence_score numeric(4,3) check(confidence_score is null or confidence_score between 0 and 1),
 is_sample boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.brokerages (
 id uuid primary key default gen_random_uuid(), business_name text not null, website_url text, public_business_phone text,
 public_enquiry_url text, city_id uuid references public.cities(id), localities text[] not null default '{}', rera_registration text,
 verification_status text not null default 'unverified' check(verification_status in ('unverified','pending','verified','rejected','stale')),
 source_id uuid references public.market_data_sources(id), source_url text, source_checked_at timestamptz, last_verified_at timestamptz,
 is_sample boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.agent_verification_records (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete restrict,
 brokerage_id uuid references public.brokerages(id) on delete set null, rera_number text,
 verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected','expired','unverified')),
 verification_method text, source_id uuid references public.market_data_sources(id), source_url text, verified_at timestamptz,
 expires_at timestamptz, verified_by uuid references auth.users(id), notes text, is_sample boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.data_rights_register (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.market_data_sources(id) on delete restrict,
 dataset_name text not null, intended_purpose text not null, collection_basis text not null default 'review_required',
 license_name text, terms_url text, redistribution_allowed boolean not null default false, consent_required boolean not null default false,
 retention_days integer check(retention_days is null or retention_days>0),
 review_status text not null default 'pending' check(review_status in ('pending','approved','restricted','rejected','expired')),
 reviewed_at timestamptz, reviewer_notes text, created_at timestamptz not null default now()
);
create table if not exists public.market_price_observations (
 id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id), locality_id uuid references public.localities(id),
 property_type text not null, transaction_type text not null check(transaction_type in ('sale','rent','lease')),
 price_min_inr numeric(14,2), price_max_inr numeric(14,2), price_per_sqft_inr numeric(12,2), area_basis text, observation_period date,
 source_id uuid references public.market_data_sources(id), source_url text, sample_size integer check(sample_size is null or sample_size>=0),
 methodology text, confidence_score numeric(4,3) check(confidence_score is null or confidence_score between 0 and 1),
 observed_at timestamptz not null default now(), is_sample boolean not null default false
);
create table if not exists public.data_quality_issues (
 id uuid primary key default gen_random_uuid(), entity_type text not null, entity_id uuid not null, issue_type text not null,
 severity text not null default 'medium' check(severity in ('low','medium','high','critical')),
 status text not null default 'open' check(status in ('open','in_review','resolved','wont_fix')),
 details jsonb not null default '{}'::jsonb, detected_at timestamptz not null default now(), resolved_at timestamptz,
 assigned_to uuid references auth.users(id), resolution_notes text
);
do $$ declare t text; begin
 foreach t in array array['market_data_sources','developers','real_estate_projects','project_inventory_observations','brokerages','agent_verification_records','data_rights_register','market_price_observations','data_quality_issues'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on table public.%I from anon, authenticated',t);
 execute format('grant all on table public.%I to service_role',t);
 end loop;
end $$;
update public.listings set status='archived',is_sample=true,featured=false,updated_at=now()
where is_sample=true and status<>'archived';
