import { create } from 'zustand'

interface UiState {
  mobileMenuOpen: boolean
  languageMenuOpen: boolean
  adminSidebarOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setLanguageMenuOpen: (open: boolean) => void
  toggleLanguageMenu: () => void
  setAdminSidebarOpen: (open: boolean) => void
  toggleAdminSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  mobileMenuOpen: false,
  languageMenuOpen: false,
  adminSidebarOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setLanguageMenuOpen: (open) => set({ languageMenuOpen: open }),
  toggleLanguageMenu: () => set((s) => ({ languageMenuOpen: !s.languageMenuOpen })),
  setAdminSidebarOpen: (open) => set({ adminSidebarOpen: open }),
  toggleAdminSidebar: () => set((s) => ({ adminSidebarOpen: !s.adminSidebarOpen })),
}))
