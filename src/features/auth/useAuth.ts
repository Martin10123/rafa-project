import { use } from 'react'
import { AuthContext, type AuthContextValue } from '@/features/auth/auth-context'

export function useAuth(): AuthContextValue {
  const value = use(AuthContext)
  if (!value) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return value
}
