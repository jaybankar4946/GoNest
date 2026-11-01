-- Retain every synthetic/sample listing and its media, but keep it out of live inventory.
-- This is intentionally scoped to rows already explicitly marked as samples.
update public.listings
set status = 'archived',
    featured = false,
    updated_at = now()
where is_sample is true
  and (status <> 'archived' or featured is distinct from false);
