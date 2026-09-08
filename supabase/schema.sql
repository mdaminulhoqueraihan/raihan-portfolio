-- Raihan portfolio CMS schema. Run in a new Supabase project.
create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.admin_users(
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings(
  key text primary key check(key ~ '^[a-z0-9_.-]+$'), label text not null,
  value text not null default '', value_type text not null default 'text' check(value_type in ('text','email','phone','url','number','textarea')),
  is_public boolean not null default true, sort_order integer not null default 0,
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null
);
create table if not exists public.content_blocks(
  id uuid primary key default gen_random_uuid(), page_slug text not null check(page_slug ~ '^[a-z0-9-]+$'),
  content_key text not null check(content_key ~ '^[a-z0-9_.-]+$'), label text not null, value text not null default '',
  content_type text not null default 'text' check(content_type in ('text','textarea','html')),
  published boolean not null default true, sort_order integer not null default 0,
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null,
  unique(page_slug,content_key)
);
create table if not exists public.services(
  id uuid primary key default gen_random_uuid(), slug text unique not null check(slug ~ '^[a-z0-9-]+$'),
  eyebrow text not null default '', title text not null, description text not null default '', items text[] not null default '{}',
  sort_order integer not null default 0, published boolean not null default true,
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null
);
create table if not exists public.experience_items(
  id uuid primary key default gen_random_uuid(), slug text unique not null check(slug ~ '^[a-z0-9-]+$'),
  date_start text not null default '', date_end text not null default '', organization text not null default '',
  title text not null, summary text not null default '', items text[] not null default '{}', sort_order integer not null default 0,
  published boolean not null default true, updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create table if not exists public.projects(
  id uuid primary key default gen_random_uuid(), slug text unique not null check(slug ~ '^[a-z0-9-]+$'),
  title text not null, category text not null default '', group_key text not null default 'retail' check(group_key in ('fashion','wellness','retail','custom')),
  summary text not null default '', image_url text not null default '', image_alt text not null default '',
  image_width integer not null default 1200 check(image_width>0), image_height integer not null default 1600 check(image_height>0),
  website_url text not null default '', ownership text not null default 'End-to-end', contribution text not null default 'Planning, UX, copy & build',
  sort_order integer not null default 0, published boolean not null default true,
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null
);
create table if not exists public.results(
  id uuid primary key default gen_random_uuid(), slug text unique not null check(slug ~ '^[a-z0-9-]+$'),
  group_key text not null check(group_key in ('store','seo','ads','other')), source text not null, period text not null default '',
  metric text not null, label text not null, context text not null default '', details jsonb not null default '[]' check(jsonb_typeof(details)='array'),
  image_url text not null default '', image_alt text not null default '', image_width integer not null default 1200 check(image_width>0),
  image_height integer not null default 800 check(image_height>0), sort_order integer not null default 0,
  published boolean not null default true, updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create table if not exists public.contact_submissions(
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  name text not null check(char_length(name) between 2 and 120),
  email text not null check(char_length(email) between 5 and 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  company text not null default '' check(char_length(company)<=160), website text not null default '' check(char_length(website)<=500),
  timeline text not null default '' check(char_length(timeline)<=120), intent text not null check(char_length(intent) between 2 and 160),
  brief text not null check(char_length(brief) between 20 and 5000), status text not null default 'new' check(status in ('new','read','replied','archived')),
  admin_notes text not null default '' check(char_length(admin_notes)<=5000), user_agent text not null default '' check(char_length(user_agent)<=500)
);
create table if not exists public.media_assets(
  id uuid primary key default gen_random_uuid(), storage_path text unique not null, public_url text not null, file_name text not null,
  mime_type text not null default '', size_bytes bigint not null default 0 check(size_bytes>=0), alt_text text not null default '',
  created_at timestamptz not null default now(), created_by uuid references auth.users(id) on delete set null
);

create or replace function private.is_portfolio_admin() returns boolean language sql stable security definer
set search_path=public,pg_temp as $$select exists(select 1 from public.admin_users where user_id=auth.uid())$$;
revoke all on function private.is_portfolio_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_portfolio_admin() to authenticated;

create or replace function private.authorize_portfolio_owner() returns trigger language plpgsql security definer
set search_path=public,pg_temp as $$begin
  if lower(new.email)=lower('mdaminulhoqueraihan@gmail.com') then
    insert into public.admin_users(user_id,email) values(new.id,lower(new.email)) on conflict(user_id) do update set email=excluded.email;
  end if;
  return new;
end$$;
drop trigger if exists authorize_portfolio_owner on auth.users;
create trigger authorize_portfolio_owner after insert or update of email on auth.users for each row execute function private.authorize_portfolio_owner();

create or replace function private.touch_updated_at() returns trigger language plpgsql set search_path=public,pg_temp as $$begin new.updated_at=now(); return new; end$$;
do $$declare t text; begin foreach t in array array['site_settings','content_blocks','services','experience_items','projects','results'] loop
  execute format('drop trigger if exists touch_updated_at on public.%I',t);
  execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
end loop; end$$;

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_blocks enable row level security;
alter table public.services enable row level security;
alter table public.experience_items enable row level security;
alter table public.projects enable row level security;
alter table public.results enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.media_assets enable row level security;

grant select on public.site_settings,public.content_blocks,public.services,public.experience_items,public.projects,public.results,public.media_assets to anon;
grant insert on public.contact_submissions to anon;
grant select,insert,update,delete on all tables in schema public to authenticated;

drop policy if exists "public settings read" on public.site_settings;
create policy "public settings read" on public.site_settings for select to anon using(is_public);
drop policy if exists "public content read" on public.content_blocks;
create policy "public content read" on public.content_blocks for select to anon using(published);
drop policy if exists "public services read" on public.services;
create policy "public services read" on public.services for select to anon using(published);
drop policy if exists "public experience read" on public.experience_items;
create policy "public experience read" on public.experience_items for select to anon using(published);
drop policy if exists "public projects read" on public.projects;
create policy "public projects read" on public.projects for select to anon using(published);
drop policy if exists "public results read" on public.results;
create policy "public results read" on public.results for select to anon using(published);
drop policy if exists "public media read" on public.media_assets;
create policy "public media read" on public.media_assets for select to anon using(true);
drop policy if exists "public contact insert" on public.contact_submissions;
create policy "public contact insert" on public.contact_submissions for insert to anon with check(status='new' and admin_notes='');

do $$declare t text; begin foreach t in array array['admin_users','site_settings','content_blocks','services','experience_items','projects','results','contact_submissions','media_assets'] loop
  execute format('drop policy if exists "admin all" on public.%I',t);
  execute format('create policy "admin all" on public.%I for all to authenticated using(private.is_portfolio_admin()) with check(private.is_portfolio_admin())',t);
end loop; end$$;

create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);
create index if not exists content_blocks_updated_by_idx on public.content_blocks(updated_by);
create index if not exists services_updated_by_idx on public.services(updated_by);
create index if not exists experience_items_updated_by_idx on public.experience_items(updated_by);
create index if not exists projects_updated_by_idx on public.projects(updated_by);
create index if not exists results_updated_by_idx on public.results(updated_by);
create index if not exists media_assets_created_by_idx on public.media_assets(created_by);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-media','portfolio-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "admin media insert" on storage.objects;
create policy "admin media insert" on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and private.is_portfolio_admin());
drop policy if exists "admin media select" on storage.objects;
create policy "admin media select" on storage.objects for select to authenticated using(bucket_id='portfolio-media' and private.is_portfolio_admin());
drop policy if exists "admin media update" on storage.objects;
create policy "admin media update" on storage.objects for update to authenticated using(bucket_id='portfolio-media' and private.is_portfolio_admin()) with check(bucket_id='portfolio-media' and private.is_portfolio_admin());
drop policy if exists "admin media delete" on storage.objects;
create policy "admin media delete" on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and private.is_portfolio_admin());
