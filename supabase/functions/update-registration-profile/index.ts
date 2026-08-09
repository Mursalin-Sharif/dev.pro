// Supabase Edge Function (Deno runtime).
// Lets a registrant update their own name/city/country/phone from the public
// "My Profile" page, identified only by their registration `id` (see
// `get-registration` for the same capability-token rationale). Email and
// date of birth are intentionally not editable here — they're the durable
// identifiers tied to the payment record.
//
// Required secrets (set via `supabase secrets set`):
//   SUPABASE_URL              (auto-provided by the platform)
//   SUPABASE_SERVICE_ROLE_KEY (auto-provided by the platform)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ProfileUpdatePayload {
  id: string
  first_name: string
  last_name: string
  city: string
  country: string
  phone: string
}

function isValidPayload(body: unknown): body is ProfileUpdatePayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.id === 'string' &&
    b.id.length > 0 &&
    typeof b.first_name === 'string' &&
    b.first_name.trim().length >= 2 &&
    typeof b.last_name === 'string' &&
    b.last_name.trim().length >= 2 &&
    typeof b.city === 'string' &&
    b.city.trim().length >= 2 &&
    typeof b.country === 'string' &&
    b.country.trim().length >= 2 &&
    typeof b.phone === 'string' &&
    b.phone.trim().length >= 6
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    if (!isValidPayload(body)) {
      return new Response(JSON.stringify({ error: 'Invalid profile update payload.' }), {
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
      .update({
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        city: body.city.trim(),
        country: body.country.trim(),
        phone: body.phone.trim(),
      })
      .eq('id', body.id)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return new Response(JSON.stringify({ error: 'Registration not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('update-registration-profile error', error)
    const message = error instanceof Error ? error.message : 'Unexpected error updating profile.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
