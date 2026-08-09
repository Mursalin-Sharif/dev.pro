-- ============================================================================
-- Hopeland Global Checkers — one-shot database setup
--
-- Run this ONCE in your Supabase project's SQL Editor:
--   https://supabase.com/dashboard/project/pskzpccgcikoyewlkmgb/sql/new
-- Paste this whole file, click "Run". It creates every table, RLS policy,
-- trigger, and storage bucket the app needs. Safe to re-run (uses
-- `if not exists` / `on conflict do nothing` everywhere).
--
-- This file is a concatenation of supabase/migrations/*.sql, in order.
-- If you add new migrations later, append them here too (or switch to the
-- Supabase CLI: `supabase link` + `supabase db push`).
-- ============================================================================

-- ── 20260101000000_profiles.sql ─────────────────────────────────────────────
-- User profiles linked to auth.users.
-- role = 'user' by default; only 'admin' / 'superadmin' get dashboard access.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin', 'superadmin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_superadmin_all" on public.profiles;
create policy "profiles_superadmin_all"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 20260101000001_helpers.sql ──────────────────────────────────────────────
-- Shared helper used by RLS policies across the schema.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'superadmin')
  );
$$;

-- ── 20260101000002_registrations.sql ────────────────────────────────────────
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  city text not null,
  country text not null,
  phone text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  fee_amount integer not null default 1000,
  fee_currency text not null default 'usd',
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_email_idx on public.registrations (email);
create index if not exists registrations_status_idx on public.registrations (status);
create unique index if not exists registrations_stripe_session_idx on public.registrations (stripe_session_id) where stripe_session_id is not null;

alter table public.registrations enable row level security;

drop policy if exists "registrations_insert_public" on public.registrations;
create policy "registrations_insert_public"
  on public.registrations for insert
  with check (true);

drop policy if exists "registrations_select_admin" on public.registrations;
create policy "registrations_select_admin"
  on public.registrations for select
  using (public.is_admin());

drop policy if exists "registrations_update_admin" on public.registrations;
create policy "registrations_update_admin"
  on public.registrations for update
  using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

-- ── 20260101000003_videos.sql ───────────────────────────────────────────────
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

drop policy if exists "videos_select_public" on public.videos;
create policy "videos_select_public"
  on public.videos for select
  using (published = true or public.is_admin());

drop policy if exists "videos_write_admin" on public.videos;
create policy "videos_write_admin"
  on public.videos for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- ── 20260101000004_sponsors.sql ─────────────────────────────────────────────
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  tier text not null default 'partner' check (tier in ('platinum', 'gold', 'silver', 'partner')),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;

drop policy if exists "sponsors_select_public" on public.sponsors;
create policy "sponsors_select_public"
  on public.sponsors for select
  using (true);

drop policy if exists "sponsors_write_admin" on public.sponsors;
create policy "sponsors_write_admin"
  on public.sponsors for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── 20260101000005_blog_posts.sql ───────────────────────────────────────────
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  author text not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_select_public" on public.blog_posts;
create policy "blog_posts_select_public"
  on public.blog_posts for select
  using (published = true or public.is_admin());

drop policy if exists "blog_posts_write_admin" on public.blog_posts;
create policy "blog_posts_write_admin"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ── 20260101000006_storage_buckets.sql ──────────────────────────────────────
-- Public read buckets for admin-uploaded media. Uploads are restricted to
-- authenticated admins; anyone can view the resulting public URLs (needed
-- since videos/sponsors/blog media are shown on the public site).

insert into storage.buckets (id, name, public)
values
  ('videos', 'videos', true),
  ('sponsor-logos', 'sponsor-logos', true),
  ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id in ('videos', 'sponsor-logos', 'blog-covers'));

drop policy if exists "media_admin_write" on storage.objects;
create policy "media_admin_write"
  on storage.objects for insert
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

-- ── 20260101000007_user_roles.sql ───────────────────────────────────────────
-- Safe to re-run on projects that already applied the older admin-default schema.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'superadmin'));

alter table public.profiles alter column role set default 'user';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop function if exists public.handle_new_admin_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'superadmin')
  );
$$;

-- ── 20260101000008_sync_admin_access.sql ────────────────────────────────────
create or replace function public.sync_admin_access()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  my_email text;
  my_role text;
  admin_count int;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into my_email from auth.users where id = uid;

  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  if my_email is not null
     and lower(my_email) = lower('mursalinsharif00@gmail.com') then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select count(*) into admin_count
  from public.profiles
  where role in ('admin', 'superadmin');

  if admin_count = 0 then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.sync_admin_access() to authenticated;

-- ── 20260101000009_ensure_my_profile.sql ────────────────────────────────────
create or replace function public.ensure_my_profile()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  my_email text;
  my_role text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into my_email from auth.users where id = uid;

  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.ensure_my_profile() to authenticated;

-- ── 20260101000010_registrations_select_own.sql ─────────────────────────────
drop policy if exists "registrations_select_own" on public.registrations;
create policy "registrations_select_own"
  on public.registrations for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.get_my_registration()
returns setof public.registrations
language sql
security definer
set search_path = public
stable
as $$
  select *
  from public.registrations
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  order by created_at desc
  limit 1;
$$;

grant execute on function public.get_my_registration() to authenticated;

-- ============================================================================
-- Done! For a stuck / missing admin, run supabase/MAKE_ADMIN.sql once.
-- Regular users stay role = 'user' and cannot open /admin.
-- Public login uses /login; player profile is /account.
-- ============================================================================
