import { InventoryPanel } from '@/features/inventory/InventoryPanel'

export function AdminInventoryPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Inventario
        </p>
        <h1 className="text-base font-medium text-foreground">Kardex</h1>
        <p className="max-w-xl text-sm text-muted-foreground text-pretty">
          Registra entradas y mermas. El stock disponible del catálogo se calcula
          con estos movimientos.
        </p>
      </div>
      <InventoryPanel />
    </section>
  )
}
