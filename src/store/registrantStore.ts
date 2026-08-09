import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RegistrantState {
  registrantId: string | null
  setRegistrantId: (id: string) => void
  clearRegistrantId: () => void
}

/**
 * Lightweight, password-less "session" for public registrants.
 *
 * There is no real account system for registrants (only Admins authenticate
 * via Supabase Auth). Instead, once someone registers, we remember their
 * registration id in this browser (persisted to localStorage) so they can
 * come back later via the "My Profile" link to view/update their details.
 * Knowing the id acts like a capability token — it is never guessable and
 * is only ever stored on the device that created it.
 */
export const useRegistrantStore = create<RegistrantState>()(
  persist(
    (set) => ({
      registrantId: null,
      setRegistrantId: (id) => set({ registrantId: id }),
      clearRegistrantId: () => set({ registrantId: null }),
    }),
    { name: 'hopeland-registrant-session' },
  ),
)
