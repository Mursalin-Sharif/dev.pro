import { supabase } from '@/lib/supabaseClient'
import { clearPendingAuth, readPendingAuth } from '@/lib/pendingAuth'
import type { Registration } from '@/types'

/**
 * After Stripe payment is confirmed, create (or sign into) the Auth account
 * using the password saved in sessionStorage during Register Now.
 * Registration rows themselves are created only by the stripe-webhook.
 */
export async function activatePaidAccount(registration: Registration): Promise<{ error: string | null }> {
  const pending = readPendingAuth()
  const email = registration.email.trim().toLowerCase()

  if (pending && pending.email !== email) {
    clearPendingAuth()
  }

  const password = pending?.email === email ? pending.password : null

  // Attach registration snapshot for client profile fallback.
  const meta = {
    championship_registration: registration,
    first_name: registration.first_name,
    last_name: registration.last_name,
  }

  if (password) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    })

    if (!signUpError) {
      clearPendingAuth()
      if (signUpData.session) return { error: null }
      // Email confirm may be required — still try password sign-in.
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      clearPendingAuth()
      return { error: signInError?.message ?? null }
    }

    const exists = /already registered|already been registered|user already exists/i.test(
      signUpError.message,
    )
    if (exists) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        await supabase.auth.updateUser({ data: meta })
      }
      clearPendingAuth()
      return { error: signInError?.message ?? null }
    }

    clearPendingAuth()
    return { error: signUpError.message }
  }

  // Payment confirmed but password session was lost — user can set login via Sign In
  // after creating/recovering their password. Registration is already in DB.
  clearPendingAuth()
  return { error: null }
}
