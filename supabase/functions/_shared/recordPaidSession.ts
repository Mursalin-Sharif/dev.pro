// Shared helpers: only create a registrations row when Stripe says paid.

import Stripe from 'npm:stripe@17'
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

const REQUIRED_METADATA_FIELDS = [
  'first_name',
  'last_name',
  'date_of_birth',
  'city',
  'country',
  'phone',
  'email',
] as const

export type RegistrationRow = {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  city: string
  country: string
  phone: string
  email: string
  status: string
  fee_amount: number
  fee_currency: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  created_at?: string
  updated_at?: string
}

/** Returns a paid Checkout Session or a short error reason. */
export async function fetchPaidCheckoutSession(
  stripe: Stripe,
  sessionId: string,
): Promise<{ session: Stripe.Checkout.Session } | { error: string; status: number }> {
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return { error: 'Invalid checkout session.', status: 404 }
  }

  if (session.payment_status !== 'paid') {
    return { error: 'Payment not completed. No account was created.', status: 402 }
  }

  return { session }
}

/** Insert (or fetch) the paid registration for a verified Checkout Session. */
export async function recordPaidRegistration(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<{ registration: RegistrationRow } | { error: string; status: number }> {
  const metadata = session.metadata ?? {}
  const missingField = REQUIRED_METADATA_FIELDS.find((field) => !metadata[field])
  if (missingField) {
    return { error: `Checkout session is missing ${missingField}.`, status: 422 }
  }

  const row = {
    first_name: metadata.first_name,
    last_name: metadata.last_name,
    date_of_birth: metadata.date_of_birth,
    city: metadata.city,
    country: metadata.country,
    phone: metadata.phone,
    email: String(metadata.email).trim().toLowerCase(),
    status: 'paid' as const,
    fee_amount: session.amount_total ?? 0,
    fee_currency: (session.currency ?? 'usd').toLowerCase(),
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
  }

  const { data: inserted, error: insertError } = await supabase
    .from('registrations')
    .insert(row as never)
    .select('*')
    .maybeSingle()

  if (insertError && insertError.code !== '23505') {
    return { error: insertError.message, status: 500 }
  }

  if (inserted) {
    return { registration: inserted as RegistrationRow }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('registrations')
    .select('*')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (fetchError) return { error: fetchError.message, status: 500 }
  if (!existing) return { error: 'Could not save paid registration.', status: 500 }

  return { registration: existing as RegistrationRow }
}

/** Create Auth user only after payment — never before. */
export async function createAuthForPaidRegistration(
  supabase: SupabaseClient,
  registration: RegistrationRow,
  password: string,
): Promise<{ error: string | null }> {
  const email = registration.email.trim().toLowerCase()
  const meta = {
    championship_registration: registration,
    first_name: registration.first_name,
    last_name: registration.last_name,
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  })

  if (!createError && created.user) {
    return { error: null }
  }

  const exists = /already|registered|exists/i.test(createError?.message ?? '')
  if (!exists) {
    return { error: createError?.message ?? 'Could not create account.' }
  }

  // Existing Auth user (e.g. retry after paid) — attach paid registration snapshot.
  const { data: listed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  const authUser = listed?.users?.find((u) => u.email?.toLowerCase() === email)
  if (!authUser) {
    return { error: 'Account already exists but could not be updated. Sign in with your password.' }
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true,
    user_metadata: meta,
  })

  return { error: updateError?.message ?? null }
}
