// Supabase Edge Function (Deno runtime).
// Verifies the Stripe webhook signature and creates the `registrations` row
// ONLY when a Checkout Session actually completes with a successful
// payment. If the payment is cancelled or fails, no row is ever created —
// there is nothing to clean up and nothing shows up in the Admin Dashboard.
//
// Required secrets (set via `supabase secrets set`):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-provided by the platform)
//
// Register this function's URL as a Stripe webhook endpoint listening for:
//   checkout.session.completed

import Stripe from 'npm:stripe@17'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const REQUIRED_METADATA_FIELDS = ['first_name', 'last_name', 'date_of_birth', 'city', 'country', 'phone', 'email'] as const

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing Stripe signature.', { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed', error)
    return new Response('Invalid signature.', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status !== 'paid') {
        console.warn('checkout.session.completed without a paid status, ignoring', session.id, session.payment_status)
        return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
      }

      const metadata = session.metadata ?? {}
      const missingField = REQUIRED_METADATA_FIELDS.find((field) => !metadata[field])
      if (missingField) {
        console.error('checkout.session.completed missing registration metadata', session.id, missingField)
        return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
      }

      // ONLY successful payments create a registrations row.
      const row = {
        first_name: metadata.first_name,
        last_name: metadata.last_name,
        date_of_birth: metadata.date_of_birth,
        city: metadata.city,
        country: metadata.country,
        phone: metadata.phone,
        email: metadata.email,
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

      // Stripe may redeliver the same event; a duplicate `stripe_session_id`
      // means this registration was already recorded, which is fine.
      if (insertError && insertError.code !== '23505') {
        throw insertError
      }

      // If the player already has an Auth user, attach the paid registration snapshot.
      const paidEmail = String(metadata.email).toLowerCase()
      try {
        const { data: listed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
        const authUser = listed?.users?.find((u) => u.email?.toLowerCase() === paidEmail)
        if (authUser) {
          const reg =
            inserted ??
            (
              await supabase
                .from('registrations')
                .select('*')
                .eq('stripe_session_id', session.id)
                .maybeSingle()
            ).data
          if (reg) {
            await supabase.auth.admin.updateUserById(authUser.id, {
              user_metadata: {
                championship_registration: reg,
                first_name: metadata.first_name,
                last_name: metadata.last_name,
              },
            })
          }
        }
      } catch (metaErr) {
        console.warn('Could not attach registration metadata to auth user', metaErr)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('stripe-webhook processing error', error)
    return new Response('Webhook processing error.', { status: 500 })
  }
})
