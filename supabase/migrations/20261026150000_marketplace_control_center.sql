-- GoNest marketplace control center: editable site content, campaigns and operational settings.
-- Apply through the Supabase migration workflow before using /admin/control-center.
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  label text not null,
  page_path text not null default '/',
  content_value text not null default '',
  status text not null default 'published' check (status in ('draft','published')),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_content_page_status_idx on public.site_content(page_path,status);

create table if not exists public.promotion_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  target_url text,
  placement text not null default 'homepage_banner' check (placement in ('homepage_banner','homepage_featured','search_sponsored')),
  status text not null default 'draft' check (status in ('draft','active','paused','ended')),
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer not null default 100,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists promotion_campaigns_active_idx on public.promotion_campaigns(placement,status,priority);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  label text not null,
  setting_value text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.promotion_campaigns enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists site_content_public_published on public.site_content;
create policy site_content_public_published on public.site_content for select to anon, authenticated using (status = 'published');
drop policy if exists site_content_admin_all on public.site_content;
create policy site_content_admin_all on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists promotion_campaigns_public_active on public.promotion_campaigns;
create policy promotion_campaigns_public_active on public.promotion_campaigns for select to anon, authenticated
using (status = 'active' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
drop policy if exists promotion_campaigns_admin_all on public.promotion_campaigns;
create policy promotion_campaigns_admin_all on public.promotion_campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.site_content, public.promotion_campaigns to anon, authenticated;
grant insert, update, delete on public.site_content, public.promotion_campaigns, public.site_settings to authenticated;
grant select on public.site_settings to authenticated;

insert into public.site_content(content_key,label,page_path,content_value,status)
values
 ('home_hero_badge','Homepage trust badge','/','Reviewed listings from verified owners and agents','published'),
 ('home_hero_title','Homepage headline','/','Find your next home.','published'),
 ('home_hero_subtitle','Homepage introduction','/','Search apartments, villas and plots to buy or rent, with clear prices, real photos and direct contact.','published')
on conflict(content_key) do nothing;

insert into public.site_settings(setting_key,label,setting_value)
values
 ('support_email','Public support email',''),
 ('default_city_focus','Homepage city focus','Mumbai,Bengaluru,Delhi NCR,Pune,Hyderabad'),
 ('default_review_sla_hours','Target listing review time (hours)','48')
on conflict(setting_key) do nothing;
