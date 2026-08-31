import { AdminProductsPanel } from '@/features/admin/AdminProductsPanel'

export function AdminHomePage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase">Panel</p>
        <h1 className="text-base font-medium text-foreground">Productos</h1>
        <p className="max-w-xl text-sm text-muted-foreground text-pretty">
          Define o actualiza el precio de cada tamaño. #7 y #8 pueden quedar
          vacíos hasta que tengas el valor.
        </p>
      </div>
      <AdminProductsPanel />
    </section>
  )
}
