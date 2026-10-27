import { AdminOrdersPanel } from '@/features/admin/AdminOrdersPanel'

export function AdminOrdersPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase">Pedidos</p>
        <h1 className="text-base font-medium text-foreground">Todos los pedidos</h1>
        <p className="max-w-xl text-sm text-muted-foreground text-pretty">
          Filtra por estado, deja una nota, cancela los que siguen abiertos o
          marca como entregado cuando ya salió.
        </p>
      </div>
      <AdminOrdersPanel />
    </section>
  )
}
