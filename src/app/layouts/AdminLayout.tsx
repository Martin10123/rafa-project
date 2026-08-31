import { Link, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'

export function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center gap-3 px-4">
          <Link to="/admin" className="text-sm font-medium text-foreground">
            Admin
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link to="/admin" />}>
              Productos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              render={<Link to="/admin/inventario" />}
            >
              Inventario
            </Button>
            <Button
              variant="ghost"
              size="sm"
              render={<Link to="/admin/galeria" />}
            >
              Galería
            </Button>
            <Button variant="ghost" size="sm" render={<Link to="/" />}>
              Tienda
            </Button>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Salir
            </Button>
          </nav>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
