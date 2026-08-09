-- Fix admin registrations list showing empty while rows exist.
-- Cause: RLS enabled on registrations with missing SELECT policies.

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
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "registrations_select_own" on public.registrations;
create policy "registrations_select_own"
  on public.registrations for select
  using (
    auth.uid() is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

notify pgrst, 'reload schema';
