/**
 * Demo-mode persistence helper.
 *
 * When Supabase isn't configured, all "admin" CRUD operations mutate plain
 * in-memory arrays (see `mockData.ts`). Without any persistence, those
 * mutations are lost the moment the page does a full reload/navigation
 * (which resets JS module state) or is viewed from a different page load —
 * e.g. adding a video in Admin wouldn't show up on the public Videos page
 * once the browser did a hard navigation there.
 *
 * This module backs each mock collection with `localStorage` so demo-mode
 * edits survive reloads and are visible across every page for the current
 * browser. It is only ever used when Supabase is not configured.
 */

const STORAGE_PREFIX = 'hopeland-demo:'

function readFromStorage<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null
  }
}

function writeToStorage<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
  } catch {
    // Storage full or unavailable (e.g. private mode) — fail silently, the
    // in-memory array still works for the current page session.
  }
}

/**
 * Returns a mutable array seeded from localStorage (if present) or the
 * provided seed data, plus a `persist` function that should be called after
 * every mutation to keep localStorage in sync.
 */
export function createDemoCollection<T>(key: string, seed: T[]) {
  const initial = readFromStorage<T>(key)
  const data: T[] = initial ?? seed.map((item) => ({ ...item }))

  return {
    data,
    persist: () => writeToStorage(key, data),
  }
}
