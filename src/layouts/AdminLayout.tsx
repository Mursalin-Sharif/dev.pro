import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminTopbar } from '@/components/layout/AdminTopbar'

export function AdminLayout() {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-surface-light lg:flex">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        <AdminTopbar />
        <main className="min-w-0 flex-1 p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
