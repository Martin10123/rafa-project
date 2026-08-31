import { CartPanel } from '@/features/cart/CartPanel'

export function CartPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Pedido
        </p>
        <h1 className="text-base font-medium text-balance text-foreground">
          Carrito
        </h1>
        <p className="max-w-xl text-sm text-pretty text-muted-foreground">
          Revisa lo que elegiste. No necesitas cuenta para agregar productos.
        </p>
      </div>
      <CartPanel />
    </section>
  )
}
