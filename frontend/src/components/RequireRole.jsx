import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function RequireRole({ role }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="text-sm text-white/70">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

