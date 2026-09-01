import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { isAdminRole } from '@/domain/auth/types'
import {
  EMAIL_CONFIRM_PENDING,
  translateAuthError,
} from '@/domain/auth/messages'
import { getProfile } from '@/data/repositories/profiles'
import { logAuthEventSafe } from '@/data/repositories/auth-logs'
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
      if (!alive) return
      if (data.session) {
        logAuthEventSafe({
          eventType: 'session_change',
          email: data.session.user.email,
          userId: data.session.user.id,
          success: true,
          message: 'Sesión restaurada',
          detail: { source: 'getSession' },
        })
      }
      void applySession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      logAuthEventSafe({
        eventType: 'session_change',
        email: session?.user.email ?? null,
        userId: session?.user.id ?? null,
        success: Boolean(session),
        message: event,
        detail: { authEvent: event as AuthChangeEvent },
      })
      void applySession(session)
    })

    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [configured, applySession])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Falta configurar Supabase (.env.local).'

    logAuthEventSafe({
      eventType: 'login_attempt',
      email,
      success: false,
      message: 'Intento de inicio de sesión',
    })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const message = translateAuthError(error.message)
      logAuthEventSafe({
        eventType: 'login_error',
        email,
        success: false,
        message,
        detail: { code: error.code, raw: error.message },
      })
      return message
    }

    logAuthEventSafe({
      eventType: 'login_success',
      email: data.user.email,
      userId: data.user.id,
      success: true,
      message: 'Inicio de sesión correcto',
    })

    return null
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabase) return 'Falta configurar Supabase (.env.local).'

      logAuthEventSafe({
        eventType: 'signup_attempt',
        email,
        success: false,
        message: 'Intento de registro',
        detail: { fullName },
      })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (error) {
        const message = translateAuthError(error.message)
        logAuthEventSafe({
          eventType: 'signup_error',
          email,
          success: false,
          message,
          detail: { code: error.code, raw: error.message },
        })
        return message
      }

      if (!data.session) {
        logAuthEventSafe({
          eventType: 'signup_confirm_pending',
          email,
          userId: data.user?.id ?? null,
          success: true,
          message: EMAIL_CONFIRM_PENDING,
          detail: {
            identities: data.user?.identities?.length ?? 0,
            emailConfirmedAt: data.user?.email_confirmed_at,
          },
        })
        return EMAIL_CONFIRM_PENDING
      }

      logAuthEventSafe({
        eventType: 'signup_success',
        email: data.user?.email ?? email,
        userId: data.user?.id ?? null,
        success: true,
        message: 'Registro con sesión activa',
      })

      return null
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return

    const email = user?.email ?? null
    const userId = user?.id ?? null

    await supabase.auth.signOut()

    logAuthEventSafe({
      eventType: 'logout',
      email,
      userId,
      success: true,
      message: 'Sesión cerrada',
    })
  }, [user])

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
