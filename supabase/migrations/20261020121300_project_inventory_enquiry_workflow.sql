-- Public project discovery and safe project enquiry/visit requests.
-- Only explicitly non-sample project records are public; unit-level inventory is shown
-- only when its availability observation is current, source-linked and verified.
drop policy if exists projects_public_inventory_read on public.project_inventory_observations;
create policy projects_public_inventory_read
on public.project_inventory_observations for select to anon, authenticated
using (
  is_sample = false
  and availability_status = 'available'
  and source_url is not null
  and observed_at >= now() - interval '14 days'
  and exists (
    select 1 from public.real_estate_projects p
    where p.id = project_inventory_observations.project_id
      and p.is_sample = false
      and p.verification_status = 'verified'
      and p.inventory_status = 'verified_available'
  )
);

create table if not exists public.project_enquiries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.real_estate_projects(id) on delete restrict,
  enquiry_type text not null check (enquiry_type in ('enquiry','site_visit')),
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  phone text not null check (char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 10 and 15),
  email text,
  preferred_date date,
  preferred_time text,
  message text,
  consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','contacted','scheduled','completed','closed','spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_visit_requires_date check (enquiry_type <> 'site_visit' or preferred_date is not null)
);
alter table public.project_enquiries enable row level security;
revoke all on table public.project_enquiries from anon, authenticated;
grant select, insert, update, delete on table public.project_enquiries to service_role;
create index if not exists project_enquiries_project_created_idx on public.project_enquiries(project_id, created_at desc);
create index if not exists project_enquiries_status_created_idx on public.project_enquiries(status, created_at desc);

create or replace function public.submit_project_enquiry(
  p_project_id uuid,
  p_type text,
  p_name text,
  p_phone text,
  p_email text default null,
  p_date date default null,
  p_time text default null,
  p_message text default null,
  p_consent boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
  v_ref text;
begin
  if p_project_id is null then raise exception 'Choose a project'; end if;
  if p_type not in ('enquiry','site_visit') then raise exception 'Invalid request type'; end if;
  if p_consent is distinct from true then raise exception 'Consent is required'; end if;
  if char_length(trim(coalesce(p_name,''))) not between 2 and 100 then raise exception 'Enter your full name'; end if;
  if char_length(regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')) not between 10 and 15 then raise exception 'Enter a valid phone number'; end if;
  if p_email is not null and char_length(trim(p_email)) > 254 then raise exception 'Email is too long'; end if;
  if p_message is not null and char_length(p_message) > 2000 then raise exception 'Message is too long'; end if;
  if p_type = 'site_visit' and (p_date is null or p_date < current_date or p_date > current_date + 90) then
    raise exception 'Choose a visit date within the next 90 days';
  end if;
  if p_time is not null and p_time not in ('10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00') then
    raise exception 'Choose an available time window';
  end if;
  if not exists (
    select 1 from public.real_estate_projects p
    where p.id = p_project_id and p.is_sample = false
      and p.verification_status in ('pending','verified')
      and p.official_project_url is not null
  ) then raise exception 'This project is not accepting requests'; end if;

  insert into public.project_enquiries(project_id,enquiry_type,full_name,phone,email,preferred_date,preferred_time,message)
  values (p_project_id,p_type,trim(p_name),trim(p_phone),nullif(trim(coalesce(p_email,'')),''),p_date,p_time,nullif(trim(coalesce(p_message,'')),''))
  returning id into v_id;
  v_ref := 'GN-' || upper(substr(replace(v_id::text,'-',''),1,10));
  return jsonb_build_object('reference',v_ref,'status','received');
end;
$$;
revoke all on function public.submit_project_enquiry(uuid,text,text,text,text,date,text,text,boolean) from public;
grant execute on function public.submit_project_enquiry(uuid,text,text,text,text,date,text,text,boolean) to anon, authenticated;
