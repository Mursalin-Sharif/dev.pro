// Supabase Edge Function (Deno runtime).
// Creates a Stripe Checkout Session for the flat registration fee and
// returns the Checkout URL to the client.
//
// No registration row is created here. The submitted details travel with
// the Checkout Session as `metadata`, and the `stripe-webhook` function is
// the only place a `registrations` row ever gets inserted — and only once
// Stripe confirms the payment actually succeeded. This means a
// cancelled/failed payment never produces a record, so it can never show up
// in the Admin Dashboard.
//
// Required secrets (set via `supabase secrets set`):
//   STRIPE_SECRET_KEY
//   SUPABASE_URL              (auto-provided by the platform)
//   SUPABASE_SERVICE_ROLE_KEY (auto-provided by the platform)
//   SITE_URL                  e.g. https://www.hopelandglobalcheckers.com
//   REGISTRATION_FEE_AMOUNT   in the smallest currency unit, e.g. 1000
//   REGISTRATION_FEE_CURRENCY e.g. usd

import Stripe from 'npm:stripe@17'
import { corsHeaders } from '../_shared/cors.ts'

interface RegistrationPayload {
  firstName: string
  lastName: string
  dateOfBirth: string
  city: string
  country: string
  phone: string
  email: string
}

function isValidPayload(body: unknown): body is RegistrationPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.firstName === 'string' &&
    b.firstName.trim().length >= 2 &&
    typeof b.lastName === 'string' &&
    b.lastName.trim().length >= 2 &&
    typeof b.dateOfBirth === 'string' &&
    b.dateOfBirth.length > 0 &&
    typeof b.city === 'string' &&
    b.city.trim().length >= 2 &&
    typeof b.country === 'string' &&
    b.country.trim().length >= 2 &&
    typeof b.phone === 'string' &&
    b.phone.trim().length >= 6 &&
    typeof b.email === 'string' &&
    /.+@.+\..+/.test(b.email)
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    if (!isValidPayload(body)) {
      return new Response(JSON.stringify({ error: 'Invalid registration payload.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Payments are not configured yet. Set STRIPE_SECRET_KEY via `supabase secrets set`.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })

    const feeAmount = Number(Deno.env.get('REGISTRATION_FEE_AMOUNT') ?? '1000')
    const feeCurrency = (Deno.env.get('REGISTRATION_FEE_CURRENCY') ?? 'usd').toLowerCase()
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    const firstName = body.firstName.trim()
    const lastName = body.lastName.trim()
    const email = body.email.trim().toLowerCase()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: feeCurrency,
            unit_amount: feeAmount,
            product_data: {
              name: 'Hopeland Global Checkers — Championship Registration',
              description: `Registration fee for ${firstName} ${lastName}`,
            },
          },
        },
      ],
      metadata: {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: body.dateOfBirth,
        city: body.city.trim(),
        country: body.country.trim(),
        phone: body.phone.trim(),
        email,
      },
      success_url: `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/register/cancelled`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('create-checkout-session error', error)
    const message = error instanceof Error ? error.message : 'Unexpected error creating checkout session.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
