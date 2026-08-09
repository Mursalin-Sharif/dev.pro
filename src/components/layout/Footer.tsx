import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, MessageCircle, Play, Send } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  const sitemapLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/videos', label: t('nav.videos') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/sponsors', label: t('nav.sponsors') },
    { to: '/register', label: t('header.registerCta') },
  ]

  const legalLinks = [
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms-of-use', label: 'Terms of Use' },
    { to: '/contact', label: t('nav.contact') },
  ]

  const socials = [
    { icon: Send, href: '#', label: 'X / Twitter' },
    { icon: Camera, href: '#', label: 'Instagram' },
    { icon: MessageCircle, href: '#', label: 'Facebook' },
    { icon: Play, href: '#', label: 'YouTube' },
  ]

  return (
    <footer className="bg-navy pb-[calc(5rem+env(safe-area-inset-bottom))] text-white/70 lg:pb-0">
      <div className="container-page section-y flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="max-w-sm min-w-0">
          <p className="text-h2 font-display font-extrabold text-white">
            Hopeland<span className="text-primary">.</span>
          </p>
          <p className="text-body-lg mt-5 text-white/60">{t('footer.tagline')}</p>
          <p className="mt-8 text-xs text-white/40">
            &copy; {new Date().getFullYear()} Hopeland Global Checkers
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-primary hover:text-white"
              >
                <s.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="min-w-0 w-full lg:w-auto">
          <p className="text-eyebrow mb-5 sm:mb-6">{t('footer.sitemapHeading')}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-12 sm:gap-y-5 md:gap-x-20">
            {sitemapLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="break-words text-xs font-extrabold leading-snug tracking-tight text-white underline decoration-primary/70 decoration-2 underline-offset-4 transition-colors hover:text-primary sm:text-sm sm:uppercase sm:underline-offset-8 md:text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <p>{t('footer.rights')}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {legalLinks.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
