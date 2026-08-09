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

/**
 * Local/dev checkout endpoint so putting STRIPE_SECRET_KEY in `.env`
 * is enough to start Stripe Checkout without Edge Functions.
 * Production still uses the Supabase `create-checkout-session` function.
 */
export function stripeCheckoutPlugin(env: EnvMap): Plugin {
  return {
    name: 'hopeland-stripe-checkout',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/create-checkout-session')) return next()
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          json(res, 405, { error: 'Method not allowed' })
          return
        }

        const secret = env.STRIPE_SECRET_KEY?.trim()
        if (!secret || secret.includes('xxx') || secret.includes('your_')) {
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
