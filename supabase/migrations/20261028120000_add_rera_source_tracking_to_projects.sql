-- Additive, nullable, reversible: record where each RERA number came from and when it was last checked.
alter table public.real_estate_projects
  add column if not exists rera_source_url text,
  add column if not exists rera_checked_at timestamptz;

comment on column public.real_estate_projects.rera_source_url is 'First-party or official URL where the RERA number was found.';
comment on column public.real_estate_projects.rera_checked_at is 'When a person last confirmed the number on the relevant state RERA website.';
