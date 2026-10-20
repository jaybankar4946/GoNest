-- Builder-only inbox for enquiries against projects submitted by the signed-in builder.
create or replace function public.get_my_project_enquiries()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then raise exception 'Sign in to view project enquiries'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'project_id', e.project_id,
    'project_name', p.official_name,
    'enquiry_type', e.enquiry_type,
    'full_name', e.full_name,
    'phone', e.phone,
    'email', e.email,
    'preferred_date', e.preferred_date,
    'preferred_time', e.preferred_time,
    'message', e.message,
    'status', e.status,
    'created_at', e.created_at
  ) order by e.created_at desc), '[]'::jsonb)
  into v_result
  from public.project_enquiries e
  join public.real_estate_projects p on p.id = e.project_id
  where p.created_by_user_id = v_user or public.is_admin();
  return v_result;
end;
$$;
revoke all on function public.get_my_project_enquiries() from public;
grant execute on function public.get_my_project_enquiries() to authenticated;
