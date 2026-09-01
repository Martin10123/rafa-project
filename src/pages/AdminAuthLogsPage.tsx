import { EventLogsPanel } from '@/features/admin/EventLogsPanel'

export function AdminAuthLogsPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Sistema
        </p>
        <h1 className="text-base font-medium text-foreground">Logs</h1>
        <p className="max-w-xl text-sm text-muted-foreground text-pretty">
          Auth, carrito, checkout, pedidos, inventario, galería y errores del
          sistema.
        </p>
      </div>
      <EventLogsPanel />
    </section>
  )
}
