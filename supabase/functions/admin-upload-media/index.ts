import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'

const ALLOWED_BUCKETS = new Set(['videos', 'sponsor-logos', 'blog-covers'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const adminClient = createClient(supabaseUrl, serviceKey)

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return json({ error: profileError.message }, 500)
    }
    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return json({ error: 'Admin access required' }, 403)
    }

    const form = await req.formData()
    const bucket = String(form.get('bucket') ?? '')
    const file = form.get('file')

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return json({ error: `Invalid bucket: ${bucket}` }, 400)
    }
    if (!(file instanceof File)) {
      return json({ error: 'Missing file' }, 400)
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${Date.now()}-${safeName}`

    const { error: uploadError } = await adminClient.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (uploadError) {
      return json({ error: uploadError.message }, 400)
    }

    const { data } = adminClient.storage.from(bucket).getPublicUrl(path)
    return json({ publicUrl: data.publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return json({ error: message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
