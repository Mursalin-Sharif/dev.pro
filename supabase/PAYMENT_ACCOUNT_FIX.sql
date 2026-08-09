-- Payment gate: registrations are created ONLY by Edge Functions
-- (stripe-webhook / finalize-paid-registration) using the service role.
-- Remove open public INSERT so unpaid users cannot fake a paid row / account.

alter table public.registrations enable row level security;

drop policy if exists "registrations_insert_public" on public.registrations;

-- No INSERT policy for anon/authenticated — service role bypasses RLS.
-- Admins still manage via existing select/update policies.

notify pgrst, 'reload schema';
