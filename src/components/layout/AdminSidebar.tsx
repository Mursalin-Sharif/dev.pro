import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, Video, Award, Newspaper, Settings, X } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/registrations', label: 'Registrations', icon: Users },
  { to: '/admin/videos', label: 'Videos', icon: Video },
  { to: '/admin/sponsors', label: 'Sponsors', icon: Award },
  { to: '/admin/blog', label: 'Blog', icon: Newspaper },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-navy text-white">
      <div className="shrink-0 px-5 pt-5 pb-4">
        <p className="px-2 text-h3 font-display font-extrabold">
          Hopeland<span className="text-primary">.</span>
          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">Admin</span>
        </p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <link.icon size={18} className="shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function AdminSidebar() {
  const { adminSidebarOpen, setAdminSidebarOpen } = useUiStore()

  useEffect(() => {
    if (!adminSidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [adminSidebarOpen])

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      <AnimatePresence>
        {adminSidebarOpen && (
          <div className="fixed inset-0 z-[1200] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminSidebarOpen(false)}
              className="absolute inset-0 bg-ink/50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-navy shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-end border-b border-white/10 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setAdminSidebarOpen(false)}
                  className="rounded-full p-2 text-white hover:bg-white/10"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <SidebarContent onNavigate={() => setAdminSidebarOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
