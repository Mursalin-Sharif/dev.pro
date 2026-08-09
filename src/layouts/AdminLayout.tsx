import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminTopbar } from '@/components/layout/AdminTopbar'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface-light lg:flex">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
