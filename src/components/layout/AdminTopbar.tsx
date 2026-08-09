import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useUiStore } from '@/store/uiStore'

export function AdminTopbar() {
  const { user, role, signOut } = useAuth()
  const { toggleAdminSidebar } = useUiStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-4 sm:px-8">
      <button onClick={toggleAdminSidebar} className="rounded-full p-2 text-ink hover:bg-black/5 lg:hidden">
        <Menu size={20} />
      </button>
      <p className="hidden text-sm text-muted sm:block">
        Signed in as {user?.email ?? 'demo@hopeland.local'}
        {role ? <span className="text-ink"> · {role}</span> : null}
      </p>
      <button
        onClick={handleSignOut}
        className="ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-black/5"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </header>
  )
}
