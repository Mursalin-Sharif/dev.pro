import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/utils'

export function MobileDrawerMenu() {
  const { t } = useTranslation()
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore()
  const { isPaidPlayer } = useAuth()

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen, setMobileMenuOpen])

  const navLinks = [
    { to: '/', label: t('mobileNav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/videos', label: t('nav.videos') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/sponsors', label: t('nav.sponsors') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1100] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,24rem)] flex-col bg-navy text-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
              <span className="text-h3 font-display font-extrabold">
                Hopeland<span className="text-primary">.</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-lg px-3 py-3 text-lg font-semibold',
                          isActive ? 'text-primary' : 'text-white/85 hover:text-white',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </nav>
            <div className="shrink-0 border-t border-white/10 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col gap-3">
                <NavLink
                  to={isPaidPlayer ? '/account' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                    {isPaidPlayer ? t('header.account') : t('header.signIn')}
                  </Button>
                </NavLink>
                {!isPaidPlayer && (
                  <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button className="w-full">{t('header.registerCta')}</Button>
                  </NavLink>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
