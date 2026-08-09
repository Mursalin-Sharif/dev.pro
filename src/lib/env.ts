/** True only during `vite` / `vite preview` local tooling — false on Vercel builds. */
export const isDevRuntime = import.meta.env.DEV

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true
  const v = value.trim().toLowerCase()
  return (
    v.length < 8 ||
    v.includes('your_') ||
    v.includes('your-') ||
    v.includes('xxxxxxxx') ||
    v.includes('change_me') ||
    v.includes('demo-anon') ||
    v === 'https://demo.supabase.co'
  )
}

/** Real Supabase project credentials (not placeholders / demo). */
export function hasSupabaseEnv(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (looksLikePlaceholder(url) || looksLikePlaceholder(key)) return false
  try {
    const host = new URL(url).hostname
    return host.endsWith('.supabase.co') || host.includes('supabase')
  } catch {
    return false
  }
}
