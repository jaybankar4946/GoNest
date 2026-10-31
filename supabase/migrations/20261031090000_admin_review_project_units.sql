-- Separate project approval from individual apartment inventory approval.
-- Public availability requires an explicit admin decision plus the existing source/freshness gates.

alter table public.project_inventory_observations
  add column if not exists review_status text not null default 'pending',
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text;

alter table public.project_inventory_observations
  drop constraint if exists project_inventory_observations_review_status_check;
alter table public.project_inventory_observations
  add constraint project_inventory_observations_review_status_check
  check (review_status in ('pending','approved','rejected'));

create index if not exists project_inventory_observations_review_queue_idx
  on public.project_inventory_observations (review_status, observed_at desc)
  where is_sample = false;

create table if not exists public.project_unit_review_events (
  id uuid primary key default gen_random_uuid(),
  unit_observation_id uuid not null references public.project_inventory_observations(id) on delete restrict,
  reviewed_by uuid not null references public.profiles(id) on delete restrict,
  decision text not null check (decision in ('approved','rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists project_unit_review_events_observation_idx
  on public.project_unit_review_events (unit_observation_id, created_at desc);

alter table public.project_unit_review_events enable row level security;
drop policy if exists project_unit_review_events_admin_read on public.project_unit_review_events;
create policy project_unit_review_events_admin_read
  on public.project_unit_review_events for select to authenticated
  using (public.is_admin());

drop policy if exists projects_public_inventory_read on public.project_inventory_observations;
create policy projects_public_inventory_read
  on public.project_inventory_observations for select to anon, authenticated
  using (
    is_sample = false
    and review_status = 'approved'
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

create or replace function public.admin_review_project_unit(
  p_unit_id uuid,
  p_decision text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'pg_temp'
as $function$
declare
  v_admin uuid := auth.uid();
  v_unit public.project_inventory_observations%rowtype;
begin
  if v_admin is null or not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin_required';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception using errcode = '22023', message = 'invalid_unit_review_decision';
  end if;

  select * into v_unit
  from public.project_inventory_observations
  where id = p_unit_id and is_sample = false
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'unit_observation_not_found';
  end if;

  if p_decision = 'approved' and (
    v_unit.availability_status <> 'available'
    or v_unit.source_url is null
    or v_unit.observed_at is null
    or v_unit.observed_at > now()
    or v_unit.observed_at < now() - interval '14 days'
  ) then
    raise exception using errcode = '22023', message = 'unit_evidence_must_be_current_and_source_linked';
  end if;

  update public.project_inventory_observations
  set review_status = p_decision,
      reviewed_by = v_admin,
      reviewed_at = now(),
      review_notes = nullif(trim(coalesce(p_notes,'')), ''),
      verified_by = case when p_decision = 'approved' then v_admin::text else null end
  where id = p_unit_id;

  insert into public.project_unit_review_events(unit_observation_id, reviewed_by, decision, notes)
  values (p_unit_id, v_admin, p_decision, nullif(trim(coalesce(p_notes,'')), ''));

  return jsonb_build_object('id', p_unit_id, 'review_status', p_decision, 'reviewed_at', now());
end;
$function$;

revoke all on function public.admin_review_project_unit(uuid,text,text) from public;
grant execute on function public.admin_review_project_unit(uuid,text,text) to authenticated;
