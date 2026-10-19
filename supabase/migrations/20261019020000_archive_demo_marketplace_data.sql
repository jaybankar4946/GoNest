-- Keep demonstration marketplace records out of the public directories.
-- Listings are retained for audit/recovery but remain archived.
alter table public.profiles
  add column if not exists is_sample boolean not null default false;

update public.profiles
set is_sample = true
where role in ('agent', 'owner');

-- These are seeded/test directory records; retain them but explicitly mark them.
update public.gonest_demo_builders set is_sample = true where is_sample is distinct from true;
update public.gonest_demo_agents set is_sample = true where is_sample is distinct from true;
update public.gonest_demo_projects set is_sample = true where is_sample is distinct from true;
update public.gonest_demo_listing_sources set is_sample = true where is_sample is distinct from true;

update public.listings
set status = 'archived',
    is_sample = true,
    featured = false,
    updated_at = now()
where status <> 'archived'
   or is_sample is distinct from true
   or featured is distinct from false;

-- Prevent queued test notifications from being sent after the sample records are hidden.
alter table public.notification_outbox
  drop constraint if exists notification_outbox_status_check;
alter table public.notification_outbox
  add constraint notification_outbox_status_check
  check (status = any (array['pending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text]));
update public.notification_outbox set status = 'cancelled' where status = 'pending';

-- Admin-only RPCs already enforce is_admin() internally; prevent anonymous invocation too.
revoke execute on function public.admin_funnel(integer) from anon;
revoke execute on function public.admin_moderate_listing(uuid, public.listing_status, public.verification_level, text) from anon;
revoke execute on function public.admin_resolve_report(uuid, text, text) from anon;
revoke execute on function public.choose_account_type(text) from anon;
