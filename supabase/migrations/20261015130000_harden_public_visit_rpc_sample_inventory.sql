-- Close the remaining sample-inventory gap in public visit RPCs.
-- Safe to apply repeatedly; this changes function behavior only, not existing rows.

create or replace function public.book_visit(
  p_listing uuid,
  p_name text,
  p_phone text,
  p_email text,
  p_date date,
  p_time text,
  p_visitors integer,
  p_method text,
  p_notes text,
  p_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v public.visits%rowtype;
  l public.listings%rowtype;
  ist timestamp := now() at time zone 'Asia/Kolkata';
begin
  if not coalesce(p_consent, false) then
    raise exception 'consent_required';
  end if;

  if nullif(trim(coalesce(p_name, '')), '') is null
     or nullif(trim(coalesce(p_phone, '')), '') is null then
    raise exception 'contact_required';
  end if;

  select * into l
  from public.listings
  where id = p_listing
    and status::text = 'active'
    and is_sample = false;

  if not found then
    raise exception 'listing_unavailable';
  end if;

  if p_date is null or p_date < ist::date or p_date > ist::date + 60 then
    raise exception 'invalid_date';
  end if;

  if p_time not in ('10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00') then
    raise exception 'invalid_time';
  end if;

  if p_date = ist::date and p_time::time <= ist::time then
    raise exception 'invalid_time';
  end if;

  if p_method not in ('phone','whatsapp','email') then
    p_method := 'phone';
  end if;

  begin
    insert into public.visits (
      listing_id, requested_by, requester_name, requester_phone, requester_email,
      slot_date, slot_time, notes, visitors, contact_method, consent_at, consent_version
    )
    values (
      p_listing, auth.uid(), trim(p_name), trim(p_phone), nullif(trim(p_email), ''),
      p_date, p_time::time, left(p_notes, 500),
      greatest(1, least(coalesce(p_visitors, 1), 20)),
      p_method, now(), '2026-10-v1'
    )
    returning * into v;
  exception when unique_violation then
    raise exception 'slot_unavailable';
  end;

  return jsonb_build_object(
    'booking_ref', v.booking_ref,
    'title', l.title,
    'slot_date', v.slot_date,
    'slot_time', to_char(v.slot_time, 'HH24:MI'),
    'visitors', v.visitors
  );
end
$function$;

create or replace function public.get_booked_slots(p_listing uuid, p_date date)
returns setof text
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
  select to_char(v.slot_time, 'HH24:MI')
  from public.visits v
  join public.listings l on l.id = v.listing_id
  where v.listing_id = p_listing
    and v.slot_date = p_date
    and l.status::text = 'active'
    and l.is_sample = false
    and v.status in ('requested'::public.visit_status, 'confirmed'::public.visit_status)
$function$;
