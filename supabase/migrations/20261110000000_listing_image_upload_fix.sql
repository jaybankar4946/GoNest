-- Restrict owner protection trigger to updates that explicitly target protected columns.
-- Property-detail edits no longer invoke the protected-field guard unnecessarily.
-- When a protected field is included, the guard still compares old/new values and
-- rejects unauthorized changes. Admin and system-managed updates remain supported.
drop trigger if exists guard_listing_owner_updates on public.listings;
create trigger guard_listing_owner_updates
before update of posted_by, poster_type, verification_level, verified, rejection_reason,
  featured, featured_until, is_sample, view_count, lead_count, saved_count, published_at, risk_flags
on public.listings
for each row execute function public.guard_listing_owner_updates();
