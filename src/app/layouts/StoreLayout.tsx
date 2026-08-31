import { useState } from 'react'
import { Link, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { AuthModal, type AuthModalView } from '@/features/auth/AuthModal'
import { useAuth } from '@/features/auth/useAuth'

export function StoreLayout() {
  const { user, isAdmin, signOut, status } = useAuth()
  const [authView, setAuthView] = useState<AuthModalView | null>(null)

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center gap-3 px-4">
          <Link to="/" className="text-sm font-medium text-foreground">
            Rafa
          </Link>
          <Button variant="ghost" size="sm" render={<Link to="/galeria" />}>
            Galería
          </Button>
          <span className="text-xs text-muted-foreground">Manillas</span>
          <nav className="ml-auto flex items-center gap-2">
            {status === 'loading' ? (
              <div className="h-7 w-16 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                {isAdmin ? (
                  <Button variant="ghost" size="sm" render={<Link to="/admin" />}>
                    Admin
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void signOut()}
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthView('login')}
                >
                  Entrar
                </Button>
                <Button size="sm" onClick={() => setAuthView('register')}>
                  Crear cuenta
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </main>
      <AuthModal
        view={authView}
        onViewChange={setAuthView}
        onClose={() => setAuthView(null)}
      />
    </div>
  )
}
