-- Enquiry submitters and listing owners must not be able to reassign lead/visit ownership,
-- change consent records, or rewrite contact details after submission.
-- Keep only the operational follow-up fields writable for authenticated users.
REVOKE UPDATE ON TABLE public.leads FROM authenticated;
REVOKE UPDATE (id, listing_id, buyer_id, buyer_name, buyer_phone, buyer_email, message, status, created_at, notes, source, consent_at, consent_version, is_sample)
ON TABLE public.leads FROM authenticated;
GRANT UPDATE (status, notes) ON TABLE public.leads TO authenticated;

REVOKE UPDATE ON TABLE public.visits FROM authenticated;
REVOKE UPDATE (id, listing_id, requested_by, requester_name, requester_phone, requester_email, slot_date, slot_time, notes, status, confirmed_by, confirmed_at, created_at, updated_at, completed_at, consent_at, consent_version, booking_ref, visitors, contact_method)
ON TABLE public.visits FROM authenticated;
GRANT UPDATE (status, notes, confirmed_by, confirmed_at, completed_at)
ON TABLE public.visits TO authenticated;
