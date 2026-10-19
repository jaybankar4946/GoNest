-- GoNest initial launch: residential properties in Mumbai and Pune only.
-- Keep legacy sample records intact, but reject new/out-of-scope listing writes.
create or replace function public.enforce_residential_launch_scope()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  launch_city text;
begin
  if new.property_type::text not in ('apartment', 'villa', 'house', 'plot', 'pg') then
    raise exception 'GoNest currently accepts residential property types only (apartment, villa, house, plot, PG).'
      using errcode = 'check_violation';
  end if;

  select c.name into launch_city
  from public.cities c
  where c.id = new.city_id;

  if launch_city is null or launch_city not in ('Mumbai', 'Pune') then
    raise exception 'GoNest is currently accepting residential listings in Mumbai and Pune only.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists listings_enforce_residential_launch_scope on public.listings;
create trigger listings_enforce_residential_launch_scope
before insert or update of city_id, property_type
on public.listings
for each row
execute function public.enforce_residential_launch_scope();
