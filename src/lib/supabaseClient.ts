import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { hasSupabaseEnv } from '@/lib/env'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True once real Supabase credentials are provided (local `.env` or Vercel env). */
export const isSupabaseConfigured = hasSupabaseEnv()

/**
 * The app is fully functional in "demo mode" (mock data, no network calls)
 * when Supabase credentials are absent, so `npm run dev` / `npm run build`
 * work out of the box before a backend is provisioned. Hooks in `src/hooks`
 * check `isSupabaseConfigured` and fall back to local mock data.
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
