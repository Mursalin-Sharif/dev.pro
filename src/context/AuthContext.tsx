import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { fetchRegistrationForEmail } from '@/hooks/useRegistrations'
import type { Profile, UserRole } from '@/types/database.types'
import type { Registration } from '@/types'

const ADMIN_ROLES: UserRole[] = ['admin', 'superadmin']

function isAdminRole(role: UserRole | null | undefined): boolean {
  return Boolean(role && ADMIN_ROLES.includes(role))
}

function fallbackProfile(userId: string, email: string | null | undefined, role: UserRole = 'user'): Profile {
  return {
    id: userId,
    email: email ?? '',
    role,
    created_at: new Date().toISOString(),
  }
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  registration: Registration | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  /** True when championship fee is paid for this account email. */
  isPaidPlayer: boolean
  refreshRegistration: (email?: string | null) => Promise<Registration | null>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; role: UserRole | null; registration: Registration | null }>
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null; signedIn: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    console.error('Failed to load profile', error.message)
    return null
  }
  return data
}

async function callRoleRpc(fn: 'ensure_my_profile' | 'sync_admin_access'): Promise<{
  role: UserRole | null
  error: string | null
}> {
  const { data, error } = await supabase.rpc(fn)
  if (error) {
    console.error(`${fn} failed`, error.message)
    return { role: null, error: error.message }
  }
  return { role: (data as UserRole | null) ?? null, error: null }
}

/**
 * Resolve profile/role without demoting admins on transient RLS/RPC failures.
 * Tries ensure_my_profile, then sync_admin_access, then table read.
 */
async function resolveProfile(
  userId: string,
  email: string | null | undefined,
  mode: 'user' | 'admin',
  previous?: Profile | null,
): Promise<{ profile: Profile | null; error: string | null }> {
  const primaryRpc = mode === 'admin' ? 'sync_admin_access' : 'ensure_my_profile'
  const secondaryRpc = mode === 'admin' ? 'ensure_my_profile' : 'sync_admin_access'

  const primary = await callRoleRpc(primaryRpc)
  let rpcRole = primary.role
  let rpcError = primary.error

  if (!rpcRole || (mode === 'user' && !isAdminRole(rpcRole) && isAdminRole(previous?.role))) {
    const secondary = await callRoleRpc(secondaryRpc)
    if (secondary.role) {
      rpcRole = secondary.role
      rpcError = secondary.error
    } else if (!rpcRole) {
      rpcError = secondary.error ?? rpcError
    }
  }

  const fromTable = await fetchProfile(userId)

  if (fromTable && isAdminRole(fromTable.role)) {
    return { profile: fromTable, error: null }
  }
  if (rpcRole && isAdminRole(rpcRole)) {
    return {
      profile: fromTable
        ? { ...fromTable, role: rpcRole }
        : fallbackProfile(userId, email, rpcRole),
      error: null,
    }
  }
  if (fromTable) return { profile: fromTable, error: null }
  if (rpcRole) return { profile: fallbackProfile(userId, email, rpcRole), error: null }

  // Keep previous admin/user profile if both lookups failed (prevents false logout).
  if (previous && previous.id === userId) {
    return { profile: previous, error: rpcError }
  }

  if (mode === 'user') return { profile: fallbackProfile(userId, email, 'user'), error: rpcError }
  return { profile: null, error: rpcError ?? 'Could not verify admin access.' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const profileRef = useRef<Profile | null>(null)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const loadRegistration = useCallback(async (email: string | null | undefined) => {
    if (!email) {
      setRegistration(null)
      return null
    }
    try {
      const reg = await fetchRegistrationForEmail(email)
      setRegistration(reg)
      return reg
    } catch (err) {
      console.error('Failed to load registration', err)
      setRegistration(null)
      return null
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const syncSession = async (next: Session | null) => {
      setSession(next)
      if (!next?.user) {
        setProfile(null)
        setRegistration(null)
        return
      }
      const { profile: nextProfile } = await resolveProfile(
        next.user.id,
        next.user.email,
        'user',
        profileRef.current,
      )
      if (cancelled) return
      setProfile(nextProfile)
      await loadRegistration(next.user.email)
    }

    supabase.auth.getSession().then(async ({ data }) => {
      await syncSession(data.session)
      if (!cancelled) setIsLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      void syncSession(newSession)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [loadRegistration])

  const role = profile?.role ?? null
  const isPaidPlayer = registration?.status === 'paid'

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role,
      registration,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      isAdmin: isSupabaseConfigured ? isAdminRole(role) : true,
      isPaidPlayer,
      refreshRegistration: async (email) => loadRegistration(email ?? session?.user?.email),
      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          return {
            error: 'Supabase is not configured yet. Add your project credentials to .env',
            role: null,
            registration: null,
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        if (error) return { error: error.message, role: null, registration: null }

        const user = data.user
        const nextSession = data.session
        if (!user || !nextSession) {
          await supabase.auth.signOut()
          return { error: 'Sign-in failed. Try again.', role: null, registration: null }
        }

        setSession(nextSession)
        const { profile: nextProfile } = await resolveProfile(user.id, user.email, 'user')
        const resolved = nextProfile ?? fallbackProfile(user.id, user.email, 'user')
        setProfile(resolved)
        const reg = await loadRegistration(user.email)
        return { error: null, role: resolved.role, registration: reg }
      },
      signInAdmin: async (email, password) => {
        if (!isSupabaseConfigured) {
          return { error: 'Supabase is not configured yet. Add your project credentials to .env' }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        if (error) return { error: error.message }

        const user = data.user
        const nextSession = data.session
        if (!user || !nextSession) {
          await supabase.auth.signOut()
          return { error: 'Sign-in failed. Try again.' }
        }

        setSession(nextSession)
        const { profile: nextProfile, error: profileError } = await resolveProfile(
          user.id,
          user.email,
          'admin',
        )
        setProfile(nextProfile)

        if (!isAdminRole(nextProfile?.role)) {
          await supabase.auth.signOut()
          setSession(null)
          setProfile(null)
          setRegistration(null)
          return {
            error:
              profileError ??
              `This account role is "${nextProfile?.role ?? 'none'}". Expected admin.`,
          }
        }

        await loadRegistration(user.email)
        return { error: null }
      },
      signUp: async (email, password) => {
        if (!isSupabaseConfigured) {
          return {
            error: 'Supabase is not configured yet. Add your project credentials to .env',
            signedIn: false,
          }
        }

        if (password.length < 6) {
          return { error: 'Password must be at least 6 characters.', signedIn: false }
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        })
        if (error) return { error: error.message, signedIn: false }

        if (!data.session?.user) {
          return { error: null, signedIn: false }
        }

        setSession(data.session)
        const { profile: nextProfile } = await resolveProfile(
          data.session.user.id,
          data.session.user.email,
          'user',
        )
        setProfile(nextProfile ?? fallbackProfile(data.session.user.id, data.session.user.email, 'user'))
        await loadRegistration(data.session.user.email)
        return { error: null, signedIn: true }
      },
      signOut: async () => {
        if (!isSupabaseConfigured) return
        await supabase.auth.signOut()
        setSession(null)
        setProfile(null)
        setRegistration(null)
      },
    }),
    [session, profile, role, registration, isLoading, isPaidPlayer, loadRegistration],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
