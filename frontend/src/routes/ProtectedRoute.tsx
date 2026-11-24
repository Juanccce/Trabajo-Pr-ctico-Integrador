import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Loading } from '../shared/components/States'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const location = useLocation()
  if (loading) return <Loading text="Revisando tu sesión" />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
