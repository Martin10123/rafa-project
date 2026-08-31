import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/domain/auth/types'

export type AuthStatus = 'loading' | 'ready'

export type AuthContextValue = {
  status: AuthStatus
  configured: boolean
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
