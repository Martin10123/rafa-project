import { useState } from 'react'
import { NavLink, Link, Outlet } from 'react-router'
import {
  ClipboardList,
  Gem,
  Images,
  LogIn,
  Menu,
  Shield,
  ShoppingBag,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/features/cart/CartDrawer'
import { CartNavButton } from '@/features/cart/CartNavButton'
import { AuthModal, type AuthModalView } from '@/features/auth/AuthModal'
import { useAuth } from '@/features/auth/useAuth'
import { useCartItemCount } from '@/features/cart/useCart'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Catálogo', icon: Gem, end: true },
  { to: '/galeria', label: 'Galería', icon: Images, end: false },
  { to: '/carrito', label: 'Carrito', icon: ShoppingBag, end: false },
] as const

function navClass(isActive: boolean) {
  return cn(
    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-300',
    isActive
      ? 'bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/40 shadow-[0_0_24px_-8px] shadow-sky-400/70'
      : 'text-slate-300 hover:bg-white/5 hover:text-white',
  )
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAdmin } = useAuth()
  const count = useCartItemCount()

  return (
    <nav className="flex flex-col gap-1" aria-label="Tienda">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => navClass(isActive)}
          onClick={onNavigate}
        >
          <item.icon className="size-4 shrink-0" aria-hidden />
          <span>{item.label}</span>
          {item.to === '/carrito' && count > 0 ? (
            <span className="ml-auto rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] font-semibold text-slate-950 tabular-nums">
              {count > 9 ? '9+' : count}
            </span>
          ) : null}
        </NavLink>
      ))}
      {user ? (
        <NavLink
          to="/pedidos"
          className={({ isActive }) => navClass(isActive)}
          onClick={onNavigate}
        >
          <ClipboardList className="size-4 shrink-0" aria-hidden />
          Pedidos
        </NavLink>
      ) : null}
      {isAdmin ? (
        <NavLink
          to="/admin"
          className={({ isActive }) => navClass(isActive)}
          onClick={onNavigate}
        >
          <Shield className="size-4 shrink-0" aria-hidden />
          Admin
        </NavLink>
      ) : null}
    </nav>
  )
}

export function StoreLayout() {
  const { user, signOut, status } = useAuth()
  const [authView, setAuthView] = useState<AuthModalView | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#071225]">
        <div className="absolute -top-40 -left-24 size-[36rem] rounded-full bg-blue-600/40 blur-3xl" />
        <div className="absolute top-1/4 right-[-8rem] size-[28rem] rounded-full bg-sky-400/30 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 size-[24rem] rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:22px_22px] opacity-30" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/45 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-sky-300 to-blue-600 text-sm font-semibold text-slate-950 shadow-[0_0_24px_-6px] shadow-sky-300">
              R
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              Rafa
            </span>
            <span className="hidden text-xs text-sky-200/80 sm:inline">
              Oro 18k
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <CartNavButton />
            {status === 'loading' ? (
              <div className="h-9 w-20 animate-pulse rounded-xl bg-white/10" />
            ) : user ? (
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Salir
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => setAuthView('login')}
                >
                  <LogIn data-icon="inline-start" />
                  Entrar
                </Button>
                <Button size="sm" onClick={() => setAuthView('register')}>
                  Crear cuenta
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col gap-6 border-r border-white/10 bg-slate-950/35 px-3 py-5 backdrop-blur-xl md:flex">
          <SideNav />
          <p className="mt-auto px-3 text-xs text-pretty text-sky-100/60">
            Balines y manillas. El amarillo marca el precio; el celeste, lo que estás viendo.
          </p>
        </aside>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute top-0 left-0 flex h-dvh w-[min(18rem,88vw)] flex-col gap-6 border-r border-white/10 bg-slate-950/80 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-6 backdrop-blur-xl">
              <SideNav onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        ) : null}

        <main className="min-h-[calc(100dvh-4rem)] min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <AuthModal
        view={authView}
        onViewChange={setAuthView}
        onClose={() => setAuthView(null)}
      />
      <CartDrawer />
    </div>
  )
}
