// Verifies the Stripe webhook signature and creates the `registrations` row
// ONLY when Checkout completes with payment_status === 'paid'.
// Auth accounts are created on the success page via finalize-paid-registration
// (never before payment succeeds).
//
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// Listen for: checkout.session.completed

import Stripe from 'npm:stripe@17'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { recordPaidRegistration } from '../_shared/recordPaidSession.ts'

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
        console.warn('checkout.session.completed without paid status — ignoring', session.id)
        return new Response(JSON.stringify({ received: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const recorded = await recordPaidRegistration(supabase, session)
      if ('error' in recorded) {
        console.error('stripe-webhook record failed', recorded.error)
        return new Response('Webhook processing error.', { status: 500 })
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
