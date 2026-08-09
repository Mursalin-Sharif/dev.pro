/** Temporary credentials kept only until Stripe payment succeeds (never written to DB). */
const KEY = 'hopeland-pending-auth'

export type PendingAuth = {
  email: string
  password: string
}

export function savePendingAuth(email: string, password: string) {
  const payload: PendingAuth = {
    email: email.trim().toLowerCase(),
    password,
  }
  sessionStorage.setItem(KEY, JSON.stringify(payload))
}

export function readPendingAuth(): PendingAuth | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingAuth
    if (!parsed?.email || !parsed?.password) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingAuth() {
  sessionStorage.removeItem(KEY)
}
