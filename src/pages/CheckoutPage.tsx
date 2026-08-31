import { CheckoutPanel } from '@/features/checkout/CheckoutPanel'

export function CheckoutPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Pago
        </p>
        <h1 className="text-base font-medium text-balance text-foreground">
          Comprobante de transferencia
        </h1>
        <p className="max-w-xl text-sm text-pretty text-muted-foreground">
          Deja tus datos, sube el pantallazo y Rafa confirmará el pago.
        </p>
      </div>
      <CheckoutPanel />
    </section>
  )
}
