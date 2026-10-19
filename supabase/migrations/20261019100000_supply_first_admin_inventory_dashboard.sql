-- Supply-first launch dashboard: targets and sample-vs-real inventory counts.
-- Read-only admin RPC; no customer inventory is created or modified by this migration.
create or replace function public.admin_launch_inventory_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception using errcode = '42501', message = 'admin access required';
  end if;

  return jsonb_build_object(
    'targets', jsonb_build_object(
      'ownerListings', 50,
      'mumbaiOwnerListings', 25,
      'puneOwnerListings', 25,
      'projects', 10,
      'agents', 10
    ),
    'listings', (
      select jsonb_build_object(
        'total', count(*),
        'sample', count(*) filter (where is_sample = true),
        'real', count(*) filter (where is_sample = false),
        'activeReal', count(*) filter (where is_sample = false and status::text = 'active'),
        'pendingReal', count(*) filter (where is_sample = false and status::text = 'pending_review'),
        'ownerReal', count(*) filter (where is_sample = false and poster_type::text = 'owner'),
        'rentReal', count(*) filter (where is_sample = false and purpose::text = 'rent'),
        'saleReal', count(*) filter (where is_sample = false and purpose::text = 'sale')
      ) from public.listings
    ),
    'projects', (
      select jsonb_build_object(
        'total', count(*),
        'sample', count(*) filter (where is_sample = true),
        'real', count(*) filter (where is_sample = false),
        'verifiedReal', count(*) filter (where is_sample = false and verification_status = 'verified'),
        'pendingReal', count(*) filter (where is_sample = false and verification_status = 'pending')
      ) from public.real_estate_projects
    ),
    'developers', (
      select jsonb_build_object(
        'total', count(*),
        'sample', count(*) filter (where is_sample = true),
        'real', count(*) filter (where is_sample = false),
        'verifiedReal', count(*) filter (where is_sample = false and verification_status = 'verified')
      ) from public.developers
    ),
    'agents', (
      select jsonb_build_object(
        'total', count(*) filter (where role::text = 'agent'),
        'sample', count(*) filter (where role::text = 'agent' and is_sample = true),
        'real', count(*) filter (where role::text = 'agent' and is_sample = false),
        'verifiedReal', count(*) filter (where role::text = 'agent' and is_sample = false and agent_verified = true)
      ) from public.profiles
    ),
    'brokerages', (
      select jsonb_build_object(
        'total', count(*),
        'sample', count(*) filter (where is_sample = true),
        'real', count(*) filter (where is_sample = false),
        'verifiedReal', count(*) filter (where is_sample = false and verification_status = 'verified'),
        'pendingReal', count(*) filter (where is_sample = false and verification_status = 'pending')
      ) from public.brokerages
    ),
    'demoWorkspace', jsonb_build_object(
      'agents', (select count(*) from public.gonest_demo_agents),
      'builders', (select count(*) from public.gonest_demo_builders),
      'projects', (select count(*) from public.gonest_demo_projects),
      'listingSources', (select count(*) from public.gonest_demo_listing_sources)
    ),
    'cities', (
      select coalesce(jsonb_agg(to_jsonb(city_counts) order by case city_counts.name when 'Mumbai' then 1 when 'Pune' then 2 else 3 end), '[]'::jsonb)
      from (
        select
          c.name,
          count(l.id) filter (where l.is_sample = false and l.poster_type::text = 'owner') as "ownerListings",
          count(l.id) filter (where l.is_sample = false and l.status::text = 'active') as "activeRealListings",
          25 as "targetOwnerListings"
        from public.cities c
        left join public.listings l on l.city_id = c.id
        where c.name in ('Mumbai', 'Pune')
        group by c.id, c.name
      ) city_counts
    )
  );
end;
$function$;

revoke all on function public.admin_launch_inventory_dashboard() from public, anon;
grant execute on function public.admin_launch_inventory_dashboard() to authenticated;
