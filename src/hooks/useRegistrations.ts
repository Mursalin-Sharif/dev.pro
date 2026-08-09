import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockRegistrations, persistRegistrations } from '@/lib/mockData'
import { registrationFee } from '@/lib/stripeClient'
import type { Registration, RegistrationStatus } from '@/types'

const QUERY_KEY = ['registrations']

export function useRegistrations() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Registration[]> => {
      if (!isSupabaseConfigured) return mockRegistrations
      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useRegistrationStats(registrations: Registration[] | undefined) {
  const list = registrations ?? []
  const paid = list.filter((r) => r.status === 'paid')
  const revenue = paid.reduce((sum, r) => sum + r.fee_amount, 0)
  return {
    total: list.length,
    paid: paid.length,
    pending: list.filter((r) => r.status === 'pending').length,
    revenue,
    currency: list[0]?.fee_currency ?? 'usd',
  }
}

export type DemoRegistrationInput = Pick<
  Registration,
  'first_name' | 'last_name' | 'date_of_birth' | 'city' | 'country' | 'phone' | 'email'
>

/**
 * Used by the public registration form in demo mode (no Supabase / Stripe
 * configured) so a submission actually shows up in the Admin Registrations
 * list instead of silently vanishing.
 */
export function useCreateDemoRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: DemoRegistrationInput) => {
      const now = new Date().toISOString()
      const registration: Registration = {
        id: crypto.randomUUID(),
        ...input,
        status: 'paid',
        fee_amount: registrationFee.amount,
        fee_currency: registrationFee.currency,
        stripe_session_id: null,
        stripe_payment_intent: null,
        created_at: now,
        updated_at: now,
      }
      mockRegistrations.unshift(registration)
      persistRegistrations()
      return registration
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export type ProfileFields = Pick<Registration, 'first_name' | 'last_name' | 'city' | 'country' | 'phone'>

/**
 * Looks up a single registration by id for the public "My Profile" page.
 * There is no real account system for registrants — the id itself (stored
 * in the browser after registering) acts as the access token, so this never
 * exposes the full registrations list.
 */
export function useMyRegistration(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'mine', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Registration | null> => {
      if (!isSupabaseConfigured) {
        return mockRegistrations.find((r) => r.id === id) ?? null
      }
      const { data, error } = await supabase.functions.invoke<Registration>('get-registration', {
        body: { id },
      })
      if (error) throw error
      return data ?? null
    },
  })
}

/** Resolves the championship registration for a signed-in email. */
export async function fetchRegistrationForEmail(email: string): Promise<Registration | null> {
  const normalized = email.trim().toLowerCase()

  if (!isSupabaseConfigured) {
    return mockRegistrations.find((r) => r.email.toLowerCase() === normalized) ?? null
  }

  // 1) Auth user_metadata / session snapshot (works when registrations RLS blocks SELECT)
  const { data: sessionData } = await supabase.auth.getSession()
  const { data: userData } = await supabase.auth.getUser()
  const metaReg = (userData.user?.user_metadata?.championship_registration ??
    sessionData.session?.user?.user_metadata?.championship_registration) as Registration | undefined
  if (metaReg?.status === 'paid' && (!metaReg.email || metaReg.email.toLowerCase() === normalized)) {
    return { ...metaReg, email: metaReg.email || normalized }
  }

  // 2) SQL RPC (after FIX_EVERYTHING.sql)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_registration')
  if (!rpcError && Array.isArray(rpcData) && rpcData[0]) {
    return rpcData[0] as Registration
  }
  if (!rpcError && rpcData && !Array.isArray(rpcData)) {
    return rpcData as Registration
  }

  // 3) Direct table (needs registrations_select_own policy)
  const { data: row } = await supabase
    .from('registrations')
    .select('*')
    .ilike('email', normalized)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (row) return row

  // 4) Edge function (if deployed)
  const { data: fnData } = await supabase.functions.invoke<Registration | null>('get-my-registration', {
    body: {},
  })
  if (fnData) return fnData

  // 5) Local registrant id capability token
  const localId = (await import('@/store/registrantStore')).useRegistrantStore.getState().registrantId
  if (localId) {
    const { data: byId } = await supabase.functions.invoke<Registration>('get-registration', {
      body: { id: localId },
    })
    if (byId && byId.email.toLowerCase() === normalized) return byId
  }

  return null
}

/**
 * Loads the championship registration for the signed-in user's email.
 */
export function useRegistrationForEmail(email: string | null | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-email', email?.toLowerCase() ?? null],
    enabled: Boolean(email),
    queryFn: () => fetchRegistrationForEmail(email!),
  })
}

export function useUpdateMyRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: ProfileFields & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = mockRegistrations.findIndex((r) => r.id === id)
        if (index === -1) throw new Error('Registration not found.')
        mockRegistrations[index] = { ...mockRegistrations[index], ...input, updated_at: new Date().toISOString() }
        persistRegistrations()
        return mockRegistrations[index]
      }
      const { data, error } = await supabase.functions.invoke<Registration>('update-registration-profile', {
        body: { id, ...input },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RegistrationStatus }) => {
      if (!isSupabaseConfigured) {
        const index = mockRegistrations.findIndex((r) => r.id === id)
        if (index !== -1) {
          mockRegistrations[index] = { ...mockRegistrations[index], status, updated_at: new Date().toISOString() }
          persistRegistrations()
        }
        return
      }
      const { error } = await supabase.from('registrations').update({ status } as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
