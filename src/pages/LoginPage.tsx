import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from '@/features/auth/LoginForm'
import { RegisterForm } from '@/features/auth/RegisterForm'
import { useAuth } from '@/features/auth/useAuth'

function getRedirectPath(state: unknown): string {
  if (!state || typeof state !== 'object') return '/'
  const from = (state as { from?: string }).from
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/'
  return from
}

export function LoginPage() {
  const { user, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = getRedirectPath(location.state)
  const [view, setView] = useState<'login' | 'register'>('login')

  if (status === 'ready' && user) {
    return <Navigate to={redirectTo} replace />
  }

  const isLogin = view === 'login'

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-12">
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-base">
            {isLogin ? 'Entrar' : 'Crear cuenta'}
          </CardTitle>
          <CardDescription className="text-xs text-pretty">
            {isLogin
              ? 'Inicia sesión para acceder al panel o guardar tu historial.'
              : 'Crea una cuenta para guardar tu historial y promociones.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <LoginForm
              onSuccess={() => navigate(redirectTo, { replace: true })}
              onSwitch={() => setView('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={() => navigate(redirectTo, { replace: true })}
              onSwitch={() => setView('login')}
            />
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          Volver a la tienda
        </Link>
      </p>
    </section>
  )
}
