import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Video, Trophy, Menu, Award, type LucideIcon } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface BottomNavItem {
  to: string
  icon: LucideIcon
  label: string
}

/**
 * Mobile bottom nav — center Home uses animated GIF (BlockDAG-style).
 * Layout: Videos · Sports · Home · Sponsors · Menu
 */
export function MobileBottomNav() {
  const { t } = useTranslation()
  const { toggleMobileMenu, mobileMenuOpen } = useUiStore()

  const leftItems: BottomNavItem[] = [
    { to: '/videos', icon: Video, label: t('mobileNav.videos') },
    { to: '/sports', icon: Trophy, label: t('mobileNav.sports') },
  ]

  if (mobileMenuOpen) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1001] grid min-h-[55px] grid-cols-5 justify-around rounded-t-xl bg-[#030d43] px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:px-2 lg:hidden"
      aria-label="Primary mobile navigation"
      style={{ height: 'calc(55px + env(safe-area-inset-bottom, 0px))' }}
    >
      {leftItems.map((item) => (
        <BottomNavLink key={item.to} {...item} />
      ))}

      <NavLink
        to="/"
        end
        aria-label={t('mobileNav.home')}
        className="relative flex -translate-y-2 flex-col items-center justify-center"
      >
        <div className="absolute top-1/2 left-1/2 flex h-[60px] w-[60px] min-h-[60px] min-w-[60px] shrink-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#030d43]">
          <img
            src="/home-button.gif"
            alt=""
            width={50}
            height={50}
            className="h-[50px] w-[50px] object-contain"
            draggable={false}
          />
        </div>
      </NavLink>

      <BottomNavLink to="/sponsors" icon={Award} label={t('nav.sponsors')} />

      <button
        type="button"
        onClick={toggleMobileMenu}
        className="flex flex-col items-center justify-center gap-0.5 text-white"
      >
        <Menu size={20} strokeWidth={2.5} className="shrink-0 sm:size-[22px]" />
        <span className="max-w-full truncate px-0.5 text-[9px] font-bold leading-none tracking-wide uppercase sm:text-[10px]">
          {t('mobileNav.menu')}
        </span>
      </button>
    </nav>
  )
}

function BottomNavLink({ to, icon: Icon, label }: BottomNavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-0.5 text-white transition-opacity',
          isActive ? 'opacity-100' : 'opacity-95 hover:opacity-100',
        )
      }
    >
      <Icon size={20} strokeWidth={2.5} className="shrink-0 sm:size-[22px]" />
      <span className="max-w-full truncate px-0.5 text-[9px] font-bold leading-none tracking-wide uppercase sm:text-[10px]">
        {label}
      </span>
    </NavLink>
  )
}
