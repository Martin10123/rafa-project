import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/useAuth'

export function RequireAuth() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="h-main w-full bg-background" aria-hidden />
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}

export function RequireAdmin() {
  const { status, user, isAdmin } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="h-main w-full bg-background" aria-hidden />
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
