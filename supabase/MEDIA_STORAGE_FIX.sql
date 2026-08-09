-- =============================================================================
-- MEDIA_STORAGE_FIX.sql
-- Run once in Supabase Dashboard → SQL Editor (project: your live site).
-- Creates public storage buckets + RLS used by admin Video / Sponsor / Blog uploads.
-- Safe to re-run.
-- =============================================================================

-- Buckets (public read — media is shown on the public site)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('sponsor-logos', 'sponsor-logos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('blog-covers', 'blog-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies (admin write via public.is_admin())
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
  )
  with check (
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

-- Ensure content tables exist (no-op if already created by SETUP.sql)
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

-- Verify
select id, name, public from storage.buckets
where id in ('videos', 'sponsor-logos', 'blog-covers')
order by id;
