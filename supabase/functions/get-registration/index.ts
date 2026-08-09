// Supabase Edge Function (Deno runtime).
// Looks up a single registration row by id for the public "My Profile" page.
//
// There is no real account system for registrants (only Admins authenticate
// via Supabase Auth). Instead, the registration `id` itself — stored in the
// requester's browser after they register — acts like a capability token:
// anyone who can prove they know the id can view/update that one row. The
// `registrations` table's RLS policies stay admin-only; this function uses
// the service role key to fetch just the requested row, so the rest of the
// registrations list is never exposed.
//
// Required secrets (set via `supabase secrets set`):
//   SUPABASE_URL              (auto-provided by the platform)
//   SUPABASE_SERVICE_ROLE_KEY (auto-provided by the platform)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const id = typeof body?.id === 'string' ? body.id : null
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing registration id.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data, error } = await supabase.from('registrations').select('*').eq('id', id).maybeSingle()
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
    console.error('get-registration error', error)
    const message = error instanceof Error ? error.message : 'Unexpected error loading registration.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
