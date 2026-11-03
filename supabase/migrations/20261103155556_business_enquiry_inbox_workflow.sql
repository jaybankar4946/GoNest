create table if not exists public.business_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'BIZ-' || to_char(now(), 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  agency_slug text not null check (char_length(btrim(agency_slug)) between 2 and 120),
  agency_name text not null check (char_length(btrim(agency_name)) between 2 and 160),
  requester_name text not null check (char_length(btrim(requester_name)) between 2 and 100),
  requester_phone text not null check (
    char_length(regexp_replace(requester_phone, '[^0-9]', '', 'g')) between 10 and 15
  ),
  requester_email text check (requester_email is null or char_length(requester_email) <= 254),
  requirement text not null default 'general'
    check (requirement in ('buy','rent','sell','general','consultation')),
  message text not null check (char_length(btrim(message)) between 2 and 2000),
  status text not null default 'new'
    check (status in ('new','contacted','routed','closed','spam')),
  consent_at timestamptz not null default now(),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_enquiries enable row level security;

drop policy if exists business_enquiries_public_insert on public.business_enquiries;
create policy business_enquiries_public_insert
  on public.business_enquiries for insert to anon, authenticated
  with check (
    char_length(btrim(agency_slug)) between 2 and 120
    and char_length(btrim(agency_name)) between 2 and 160
    and char_length(btrim(requester_name)) between 2 and 100
    and char_length(regexp_replace(requester_phone, '[^0-9]', '', 'g')) between 10 and 15
    and char_length(btrim(message)) between 2 and 2000
    and status = 'new'
    and admin_notes is null
  );

drop policy if exists business_enquiries_admin_select on public.business_enquiries;
create policy business_enquiries_admin_select
  on public.business_enquiries for select to authenticated
  using (public.is_admin());

drop policy if exists business_enquiries_admin_update on public.business_enquiries;
create policy business_enquiries_admin_update
  on public.business_enquiries for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.business_enquiries from anon, authenticated;
grant insert (agency_slug, agency_name, requester_name, requester_phone, requester_email, requirement, message)
  on public.business_enquiries to anon, authenticated;
grant select, update on public.business_enquiries to authenticated;

create index if not exists business_enquiries_created_at_idx
  on public.business_enquiries (created_at desc);
create index if not exists business_enquiries_status_created_at_idx
  on public.business_enquiries (status, created_at desc);
