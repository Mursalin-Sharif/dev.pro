/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_REGISTRATION_FEE_AMOUNT: string
  readonly VITE_REGISTRATION_FEE_CURRENCY: string
  readonly VITE_GEO_LOOKUP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
