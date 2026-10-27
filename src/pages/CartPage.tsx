import { CartPanel } from '@/features/cart/CartPanel'

export function CartPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.22em] text-sky-200 uppercase">
          Pedido
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance text-white">
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
