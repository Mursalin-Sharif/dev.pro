import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

type EnvMap = Record<string, string>

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

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function stripeSecret(env: EnvMap) {
  const secret = env.STRIPE_SECRET_KEY?.trim()
  if (!secret || secret.includes('xxx') || secret.includes('your_')) return null
  return secret
}

function supabaseConfig(env: EnvMap) {
  const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = (
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    ''
  ).trim()
  return { url, serviceKey }
}

type StripeSessionPayload = {
  id?: string
  payment_status?: string
  amount_total?: number
  currency?: string
  payment_intent?: string | null
  metadata?: Record<string, string>
  error?: { message?: string }
}

type StripeSessionLookupSuccess = {
  session: StripeSessionPayload
}

type StripeSessionLookupError = {
  error: string
  status: number
}

async function stripeGetSession(
  secret: string,
  sessionId: string,
): Promise<StripeSessionLookupSuccess | StripeSessionLookupError> {
  const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const data = (await stripeRes.json()) as StripeSessionPayload
  if (!stripeRes.ok) {
    return { error: data.error?.message ?? 'Invalid checkout session.', status: stripeRes.status === 404 ? 404 : 502 }
  }
  return { session: data }
}

type UpsertPaidRegistrationSuccess = {
  registration: unknown
}

type UpsertPaidRegistrationError = {
  error: string
  status: number
}

async function upsertPaidRegistration(
  url: string,
  serviceKey: string,
  session: {
    id: string
    amount_total?: number
    currency?: string
    payment_intent?: string | null
    metadata?: Record<string, string>
  },
): Promise<UpsertPaidRegistrationSuccess | UpsertPaidRegistrationError> {
  const metadata = session.metadata ?? {}
  const required = ['first_name', 'last_name', 'date_of_birth', 'city', 'country', 'phone', 'email'] as const
  const missing = required.find((field) => !metadata[field])
  if (missing) return { error: `Checkout session is missing ${missing}.`, status: 422 as const }

  const row = {
    first_name: metadata.first_name,
    last_name: metadata.last_name,
    date_of_birth: metadata.date_of_birth,
    city: metadata.city,
    country: metadata.country,
    phone: metadata.phone,
    email: String(metadata.email).trim().toLowerCase(),
    status: 'paid',
    fee_amount: session.amount_total ?? 0,
    fee_currency: (session.currency ?? 'usd').toLowerCase(),
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
  }

  const insertRes = await fetch(`${url}/rest/v1/registrations?select=*`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  })

  if (insertRes.ok) {
    const rows = (await insertRes.json()) as unknown[]
    const registration = Array.isArray(rows) ? rows[0] : rows
    if (registration) return { registration }
  }

  // Duplicate session — fetch existing paid row.
  const getRes = await fetch(
    `${url}/rest/v1/registrations?stripe_session_id=eq.${encodeURIComponent(session.id)}&select=*&limit=1`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  )
  if (getRes.ok) {
    const rows = (await getRes.json()) as unknown[]
    if (Array.isArray(rows) && rows[0]) return { registration: rows[0] }
  }

  const errText = await insertRes.text().catch(() => '')
  return { error: errText || 'Could not save paid registration.', status: 500 as const }
}

async function createAuthUser(
  url: string,
  serviceKey: string,
  registration: { email: string; first_name: string; last_name: string; [key: string]: unknown },
  password: string,
) {
  const email = String(registration.email).trim().toLowerCase()
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        championship_registration: registration,
        first_name: registration.first_name,
        last_name: registration.last_name,
      },
    }),
  })

  if (createRes.ok) return { error: null as string | null }

  const body = (await createRes.json().catch(() => ({}))) as { msg?: string; message?: string; error_description?: string }
  const message = body.msg || body.message || body.error_description || 'Could not create account.'
  if (!/already|registered|exists/i.test(message)) {
    return { error: message }
  }

  // Existing user — update metadata (+ password so Register password works).
  const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  })
  if (!listRes.ok) return { error: 'Account already exists. Sign in with your password.' }

  const listed = (await listRes.json()) as { users?: Array<{ id: string; email?: string }> }
  const authUser = listed.users?.find((u) => u.email?.toLowerCase() === email)
  if (!authUser) return { error: 'Account already exists. Sign in with your password.' }

  const updateRes = await fetch(`${url}/auth/v1/admin/users/${authUser.id}`, {
    method: 'PUT',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password,
      email_confirm: true,
      user_metadata: {
        championship_registration: registration,
        first_name: registration.first_name,
        last_name: registration.last_name,
      },
    }),
  })

  if (!updateRes.ok) {
    const updateBody = (await updateRes.json().catch(() => ({}))) as { msg?: string; message?: string }
    return { error: updateBody.msg || updateBody.message || 'Could not update account.' }
  }

  return { error: null as string | null }
}

/**
 * Local/dev Stripe endpoints so `.env` STRIPE_SECRET_KEY works without
 * waiting on Edge Function deploy. Production still uses Supabase functions.
 */
export function stripeCheckoutPlugin(env: EnvMap): Plugin {
  return {
    name: 'hopeland-stripe-checkout',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''

        if (path === '/api/finalize-paid-registration') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }
          if (req.method !== 'POST') {
            json(res, 405, { error: 'Method not allowed' })
            return
          }

          const secret = stripeSecret(env)
          if (!secret) {
            json(res, 503, { error: 'Stripe secret key missing in .env' })
            return
          }

          try {
            const body = (await readJsonBody(req)) as { sessionId?: string; password?: string }
            const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : ''
            const password = typeof body.password === 'string' ? body.password : ''
            if (!sessionId) {
              json(res, 400, { error: 'Missing Stripe session id.' })
              return
            }

            const paid = await stripeGetSession(secret, sessionId)
            if ('error' in paid) {
              json(res, paid.status, { error: paid.error, paid: false })
              return
            }

            if (paid.session.payment_status !== 'paid') {
              json(res, 402, { error: 'Payment not completed. No account was created.', paid: false })
              return
            }

            const { url, serviceKey } = supabaseConfig(env)
            if (!url || !serviceKey) {
              json(res, 503, {
                error:
                  'Add SUPABASE_SERVICE_ROLE_KEY to .env (Supabase → Settings → API → service_role) so paid registrations can be saved locally.',
                paid: true,
              })
              return
            }

            if (!paid.session.id) {
              json(res, 500, { error: 'Stripe session missing id.', paid: true })
              return
            }

            const recorded = await upsertPaidRegistration(url, serviceKey, {
              id: paid.session.id,
              amount_total: paid.session.amount_total,
              currency: paid.session.currency,
              payment_intent: paid.session.payment_intent,
              metadata: paid.session.metadata,
            })
            if ('error' in recorded) {
              json(res, recorded.status, { error: recorded.error, paid: true })
              return
            }

            let accountError: string | null = null
            if (password.length >= 6) {
              const auth = await createAuthUser(
                url,
                serviceKey,
                recorded.registration as {
                  email: string
                  first_name: string
                  last_name: string
                },
                password,
              )
              accountError = auth.error
            }

            json(res, 200, {
              paid: true,
              registration: recorded.registration,
              accountCreated: password.length >= 6 && !accountError,
              accountError,
            })
          } catch (err) {
            json(res, 500, {
              error: err instanceof Error ? err.message : 'Unexpected error finalizing payment.',
            })
          }
          return
        }

        if (!path.startsWith('/api/create-checkout-session')) return next()
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          json(res, 405, { error: 'Method not allowed' })
          return
        }

        const secret = stripeSecret(env)
        if (!secret) {
          json(res, 503, {
            error:
              'Stripe secret key missing. Set STRIPE_SECRET_KEY in your .env file (sk_test_… or sk_live_…).',
          })
          return
        }

        try {
          const body = await readJsonBody(req)
          if (!isValidPayload(body)) {
            json(res, 400, { error: 'Invalid registration payload.' })
            return
          }

          const feeAmount = Number(env.VITE_REGISTRATION_FEE_AMOUNT || env.REGISTRATION_FEE_AMOUNT || 1000)
          const feeCurrency = (
            env.VITE_REGISTRATION_FEE_CURRENCY ||
            env.REGISTRATION_FEE_CURRENCY ||
            'usd'
          ).toLowerCase()
          const siteUrl = (env.SITE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')

          const firstName = body.firstName.trim()
          const lastName = body.lastName.trim()
          const email = body.email.trim().toLowerCase()

          const params = new URLSearchParams()
          params.set('mode', 'payment')
          params.append('payment_method_types[]', 'card')
          params.set('customer_email', email)
          params.set('success_url', `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`)
          params.set('cancel_url', `${siteUrl}/register/cancelled`)
          params.set('line_items[0][quantity]', '1')
          params.set('line_items[0][price_data][currency]', feeCurrency)
          params.set('line_items[0][price_data][unit_amount]', String(feeAmount))
          params.set(
            'line_items[0][price_data][product_data][name]',
            'Hopeland Global Checkers — Championship Registration',
          )
          params.set(
            'line_items[0][price_data][product_data][description]',
            `Registration fee for ${firstName} ${lastName}`,
          )
          params.set('metadata[first_name]', firstName)
          params.set('metadata[last_name]', lastName)
          params.set('metadata[date_of_birth]', body.dateOfBirth)
          params.set('metadata[city]', body.city.trim())
          params.set('metadata[country]', body.country.trim())
          params.set('metadata[phone]', body.phone.trim())
          params.set('metadata[email]', email)

          const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secret}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          })

          const data = (await stripeRes.json()) as { url?: string; error?: { message?: string } }
          if (!stripeRes.ok || !data.url) {
            json(res, 500, {
              error: data.error?.message ?? 'Unexpected error creating checkout session.',
            })
            return
          }

          json(res, 200, { url: data.url })
        } catch (err) {
          json(res, 500, {
            error: err instanceof Error ? err.message : 'Unexpected error creating checkout session.',
          })
        }
      })
    },
  }
}
