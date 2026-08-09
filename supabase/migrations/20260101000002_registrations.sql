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

-- Anyone can create a registration (the public Register form). Server-side
-- validation happens in the create-checkout-session Edge Function before
-- this row is inserted, so this policy intentionally stays permissive.
create policy "registrations_insert_public"
  on public.registrations for insert
  with check (true);

-- Only admins can read the registration list (used by the Admin Dashboard
-- and CSV/Excel export). The Stripe webhook uses the service role key,
-- which bypasses RLS entirely, so it does not need its own policy here.
create policy "registrations_select_admin"
  on public.registrations for select
  using (public.is_admin());

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
