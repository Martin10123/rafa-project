import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isAdminRole } from '@/domain/auth/types'
import { getProfile } from '@/data/repositories/profiles'
import { isSupabaseConfigured, supabase } from '@/data/supabase/client'
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/features/auth/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [status, setStatus] = useState<AuthStatus>(configured ? 'loading' : 'ready')
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null)

  const applySession = useCallback(async (session: Session | null) => {
    const nextProfile = session?.user ? await getProfile(session.user.id) : null
    setUser(session?.user ?? null)
    setProfile(nextProfile)
    setStatus('ready')
  }, [])

  useEffect(() => {
    if (!configured || !supabase) return

    let alive = true

    void supabase.auth.getSession().then(({ data }) => {
      if (alive) void applySession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session)
    })

    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [configured, applySession])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Falta configurar Supabase (.env.local).'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabase) return 'Falta configurar Supabase (.env.local).'
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      return error?.message ?? null
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      configured,
      user,
      profile,
      isAdmin: isAdminRole(profile?.role),
      signIn,
      signUp,
      signOut,
    }),
    [status, configured, user, profile, signIn, signUp, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
