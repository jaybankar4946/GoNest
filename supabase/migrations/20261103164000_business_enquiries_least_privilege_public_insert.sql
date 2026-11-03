-- Keep public business-enquiry inserts least-privilege and validate only
-- requester-controlled fields. Server-managed fields retain database defaults.
revoke insert on table public.business_enquiries from anon, authenticated;
grant insert (reference, agency_slug, agency_name, requester_name, requester_phone, requester_email, requirement, message, consent_at)
on table public.business_enquiries to anon, authenticated;

drop policy if exists business_enquiries_public_insert on public.business_enquiries;
create policy business_enquiries_public_insert
on public.business_enquiries for insert to anon, authenticated
with check (
  char_length(btrim(agency_slug)) between 2 and 120
  and char_length(btrim(agency_name)) between 2 and 160
  and char_length(btrim(requester_name)) between 2 and 100
  and char_length(regexp_replace(requester_phone, '[^0-9]', '', 'g')) between 10 and 15
  and (requester_email is null or char_length(requester_email) <= 254)
  and requirement in ('buy','rent','sell','general','consultation')
  and char_length(btrim(message)) between 2 and 2000
  and consent_at between now() - interval '10 minutes' and now() + interval '1 minute'
);
