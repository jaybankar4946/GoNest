-- 1) Allow supply-funnel event names (same body and safeguards as before; names only extended).
create or replace function public.track_event(p_name text, p_session text, p_listing uuid default null::uuid, p_meta jsonb default '{}'::jsonb)
 returns void
 language plpgsql
 security definer
 set search_path to 'pg_catalog', 'public', 'pg_temp'
as $function$
begin
  if p_name not in ('session_start','search','property_view','save','call_click','whatsapp_click','lead_submitted','visit_requested',
                    'supply_landing_view','supply_role_click','supply_account_type_chosen','supply_agency_submitted','supply_project_submitted','supply_submit_failed') then return; end if;
  if p_session is null or char_length(p_session) not between 8 and 64 then return; end if;
  if (select count(*) from public.events where session_id = p_session and created_at > now() - interval '1 minute') >= 60 then return; end if;
  insert into public.events (name, session_id, listing_id, user_id, meta)
  values (p_name, p_session, p_listing, auth.uid(), case when p_meta is null or char_length(p_meta::text) > 500 then '{}'::jsonb else p_meta end);
exception when foreign_key_violation then
  insert into public.events (name, session_id, user_id) values (p_name, p_session, auth.uid());
end $function$;

-- 2) Admin-only supply funnel report (see admin Funnel tab).
create or replace function public.admin_supply_funnel(p_days integer default 14)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'pg_catalog', 'public', 'pg_temp'
as $function$
declare d integer := greatest(1, least(coalesce(p_days, 14), 90));
begin
  if not public.is_admin() then raise exception 'not_authorized'; end if;
  return jsonb_build_object(
    'days', d,
    'supply_events', coalesce((
      select jsonb_agg(jsonb_build_object('name', t.name, 'events', t.n, 'people', t.people) order by t.name)
      from (select e.name, count(*) as n, count(distinct coalesce(e.user_id::text, e.session_id)) as people
            from public.events e
            where not coalesce(e.is_sample, false) and e.name like 'supply\_%' and e.created_at > now() - make_interval(days => d)
            group by e.name) t), '[]'::jsonb),
    'demand', jsonb_build_object(
      'sessions',        (select count(distinct session_id) from public.events where not coalesce(is_sample,false) and name='session_start'  and created_at > now() - make_interval(days => d)),
      'searchers',       (select count(distinct coalesce(user_id::text, session_id)) from public.events where not coalesce(is_sample,false) and name='search'         and created_at > now() - make_interval(days => d)),
      'property_viewers',(select count(distinct coalesce(user_id::text, session_id)) from public.events where not coalesce(is_sample,false) and name='property_view'  and created_at > now() - make_interval(days => d)),
      'enquiries',       (select count(*) from public.events where not coalesce(is_sample,false) and name='lead_submitted' and created_at > now() - make_interval(days => d))),
    'submissions', jsonb_build_object(
      'projects_new',     (select count(*) from public.real_estate_projects where not coalesce(is_sample,false) and created_by_user_id is not null and created_at > now() - make_interval(days => d)),
      'agencies_new',     (select count(*) from public.brokerages           where not coalesce(is_sample,false) and created_by_user_id is not null and created_at > now() - make_interval(days => d)),
      'projects_pending', (select count(*) from public.real_estate_projects where not coalesce(is_sample,false) and verification_status = 'pending'),
      'agencies_pending', (select count(*) from public.brokerages           where not coalesce(is_sample,false) and verification_status = 'pending'),
      'projects_verified',(select count(*) from public.real_estate_projects where not coalesce(is_sample,false) and verification_status = 'verified')),
    'accounts', jsonb_build_object(
      'builders', (select count(*) from public.profiles where role = 'builder' and not coalesce(is_sample,false)),
      'agents',   (select count(*) from public.profiles where role = 'agent'   and not coalesce(is_sample,false)),
      'owners',   (select count(*) from public.profiles where role = 'owner'   and not coalesce(is_sample,false)))
  );
end $function$;

revoke all on function public.admin_supply_funnel(integer) from public, anon;
grant execute on function public.admin_supply_funnel(integer) to authenticated;
