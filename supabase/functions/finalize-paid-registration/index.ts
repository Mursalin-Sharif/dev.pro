// After Stripe Checkout redirects to /register/success:
// 1) Verify the session is actually paid (balance / card succeeded)
// 2) Insert registrations row only if paid
// 3) Create Auth account only if paid + password provided
// Failed / unpaid sessions never create a registration or account.
//
// Required secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'npm:stripe@17'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  createAuthForPaidRegistration,
  fetchPaidCheckoutSession,
  recordPaidRegistration,
} from '../_shared/recordPaidSession.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing Stripe session id.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: 'Payments are not configured.' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
    const paid = await fetchPaidCheckoutSession(stripe, sessionId)
    if ('error' in paid) {
      return new Response(JSON.stringify({ error: paid.error, paid: false }), {
        status: paid.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const recorded = await recordPaidRegistration(supabase, paid.session)
    if ('error' in recorded) {
      return new Response(JSON.stringify({ error: recorded.error, paid: true }), {
        status: recorded.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let accountError: string | null = null
    if (password.length >= 6) {
      const authResult = await createAuthForPaidRegistration(supabase, recorded.registration, password)
      accountError = authResult.error
    }

    return new Response(
      JSON.stringify({
        paid: true,
        registration: recorded.registration,
        accountCreated: password.length >= 6 && !accountError,
        accountError,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('finalize-paid-registration error', error)
    const message = error instanceof Error ? error.message : 'Unexpected error finalizing payment.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
