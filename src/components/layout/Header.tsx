import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Menu, UserRound } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function Header() {
  const { t } = useTranslation()
  const { toggleMobileMenu } = useUiStore()
  const { isPaidPlayer, isAdmin } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/about', label: t('nav.about') },
    { to: '/videos', label: t('nav.videos') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/sponsors', label: t('nav.sponsors') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <motion.header
      initial={false}
      animate={{
        paddingTop: scrolled ? 10 : 18,
        paddingBottom: scrolled ? 10 : 18,
      }}
      transition={{ duration: 0.25 }}
      className={cn(
        'sticky top-0 z-30 w-full border-b transition-colors',
        scrolled ? 'border-black/5 bg-white/90 backdrop-blur-md' : 'border-transparent bg-white',
      )}
    >
      <div className="container-page flex min-w-0 items-center justify-between gap-2 sm:gap-4">
        <Link to="/" className="min-w-0 shrink truncate text-lg font-display font-extrabold text-ink sm:text-xl md:text-h3">
          Hopeland<span className="text-primary">.</span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-5 xl:gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap text-sm font-semibold transition-colors hover:text-primary',
                  isActive ? 'text-primary' : 'text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 md:flex">
            {isPaidPlayer ? (
              <Link to="/account">
                <Button size="sm" variant="outline" icon={<UserRound size={16} />}>
                  {t('header.account')}
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline">
                  {t('header.signIn')}
                </Button>
              </Link>
            )}
            {!isPaidPlayer && (
              <Link to="/register">
                <Button size="sm">{t('header.registerCta')}</Button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button size="sm" variant="ghost">
                  Admin
                </Button>
              </Link>
            )}
          </div>
          <button
            onClick={toggleMobileMenu}
            aria-label="Open menu"
            className="rounded-full p-2 text-ink hover:bg-black/5 lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </motion.header>
  )
}
