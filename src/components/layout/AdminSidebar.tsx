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
    <div className="flex h-full flex-col bg-navy p-5 text-white">
      <p className="mb-8 px-2 text-h3 font-display font-extrabold">
        Hopeland<span className="text-primary">.</span>
        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">Admin</span>
      </p>
      <nav className="flex flex-col gap-1">
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
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function AdminSidebar() {
  const { adminSidebarOpen, setAdminSidebarOpen } = useUiStore()

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      <AnimatePresence>
        {adminSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
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
              className="absolute inset-y-0 left-0 w-72"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setAdminSidebarOpen(false)} className="rounded-full p-2 text-white hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent onNavigate={() => setAdminSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
