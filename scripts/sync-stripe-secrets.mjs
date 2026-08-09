/**
 * Reads Stripe keys from `.env` and pushes them to Supabase Edge Function secrets.
 *
 * Usage:
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   npm run stripe:sync
 *
 * Requires: .env with STRIPE_SECRET_KEY (+ optional STRIPE_WEBHOOK_SECRET, SITE_URL, fees)
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const envPath = path.join(root, '.env')
if (!fs.existsSync(envPath)) {
  console.error('Missing .env — copy .env.example and fill Stripe keys first.')
  process.exit(1)
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    }),
)

const secret = env.STRIPE_SECRET_KEY
if (!secret || /xxx|your_|change_me/i.test(secret)) {
  console.error('Set a real STRIPE_SECRET_KEY (sk_test_… or sk_live_…) in .env first.')
  process.exit(1)
}

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error('Set SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens), then re-run.')
  process.exit(1)
}

const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  (env.VITE_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? '')

if (!projectRef) {
  console.error('Could not detect Supabase project ref from VITE_SUPABASE_URL.')
  process.exit(1)
}

const pairs = {
  STRIPE_SECRET_KEY: secret,
  SITE_URL: env.SITE_URL || 'http://127.0.0.1:5173',
  REGISTRATION_FEE_AMOUNT: env.VITE_REGISTRATION_FEE_AMOUNT || env.REGISTRATION_FEE_AMOUNT || '1000',
  REGISTRATION_FEE_CURRENCY: (
    env.VITE_REGISTRATION_FEE_CURRENCY ||
    env.REGISTRATION_FEE_CURRENCY ||
    'usd'
  ).toLowerCase(),
}

if (env.STRIPE_WEBHOOK_SECRET && !/xxx|your_/i.test(env.STRIPE_WEBHOOK_SECRET)) {
  pairs.STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET
}

const args = ['supabase', 'secrets', 'set', `--project-ref=${projectRef}`]
for (const [k, v] of Object.entries(pairs)) {
  args.push(`${k}=${v}`)
}

console.log(`Syncing Stripe secrets to project ${projectRef}…`)
const result = spawnSync('npx', args, { stdio: 'inherit', shell: true, env: process.env })
if (result.status !== 0) process.exit(result.status ?? 1)

console.log('Done. Also deploy functions if needed:')
console.log('  npx supabase functions deploy create-checkout-session --project-ref', projectRef)
console.log('  npx supabase functions deploy stripe-webhook --project-ref', projectRef)
console.log('  npx supabase functions deploy finalize-paid-registration --project-ref', projectRef)
