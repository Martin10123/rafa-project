import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/useAuth'

export function RequireAuth() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <div className="h-main w-full bg-surface-base" aria-hidden />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function RequireAdmin() {
  const { status, user, isAdmin } = useAuth()

  if (status === 'loading') {
    return <div className="h-main w-full bg-surface-base" aria-hidden />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
