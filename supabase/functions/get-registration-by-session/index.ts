// Supabase Edge Function (Deno runtime).
// Used by the public /register/success page to find the registration that
// the `stripe-webhook` function creates after a successful payment. The
// webhook can take a moment to arrive, so the client polls this endpoint
// briefly with the Stripe Checkout `session_id` from the redirect URL.
//
// Required secrets:
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-provided by the platform)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : null
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing Stripe session id.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return new Response(JSON.stringify({ error: 'Not found yet.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('get-registration-by-session error', error)
    const message = error instanceof Error ? error.message : 'Unexpected error looking up registration.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
