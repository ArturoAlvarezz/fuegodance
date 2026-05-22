import { Outlet, Navigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLayout() {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-dark-obsidian lg:flex">
      <AdminSidebar />
      <main className="w-full min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
