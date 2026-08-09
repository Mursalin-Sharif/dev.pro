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

create policy "sponsors_select_public"
  on public.sponsors for select
  using (true);

create policy "sponsors_write_admin"
  on public.sponsors for all
  using (public.is_admin())
  with check (public.is_admin());
