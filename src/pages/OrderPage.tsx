import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  formatOrderTotal,
  orderReference,
  orderStatusLabel,
} from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { PaymentInstructions } from '@/features/checkout/PaymentInstructions'
import { ProofUpload } from '@/features/checkout/ProofUpload'
import { OrderLines } from '@/features/orders/OrderLines'
import { useCheckoutOrder } from '@/features/orders/useOrders'

function statusCopy(status: string, rejectionReason: string | null) {
  switch (status) {
    case 'awaiting_proof':
      return 'Sube la foto de la transferencia para que Rafa revise el pago.'
    case 'review':
      return 'Rafa está revisando tu comprobante.'
    case 'approved':
      return 'Pago aprobado. Rafa coordinará la entrega al teléfono del pedido.'
    case 'rejected':
      return rejectionReason
        ? `Comprobante rechazado: ${rejectionReason}`
        : 'Rafa rechazó el comprobante y te contactará al teléfono del pedido.'
    case 'cancelled':
      return 'Este pedido fue cancelado.'
    case 'delivered':
      return 'Pedido entregado.'
    default:
      return null
  }
}

export function OrderPage() {
  const { orderId = '' } = useParams()
  const query = useCheckoutOrder(orderId)

  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
        <p className="text-sm text-muted-foreground text-pretty">
          Configura Supabase para ver el pedido.
        </p>
      </section>
    )
  }

  if (query.isLoading) {
    return (
      <section className="mx-auto w-full max-w-xl px-4 py-8">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </section>
    )
  }

  if (query.isError || !query.data) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
        <p className="text-sm text-destructive text-pretty">
          {query.error instanceof Error
            ? query.error.message
            : 'Pedido no encontrado.'}
        </p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Volver al catálogo
        </Button>
      </section>
    )
  }

  const order = query.data
  const copy = statusCopy(order.status, order.rejectionReason)

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Pedido
        </p>
        <h1 className="text-base font-medium text-foreground">
          Referencia {orderReference(order.id)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {order.customerName} · {orderStatusLabel(order.status)}
        </p>
      </div>

      <OrderLines items={order.items} />
      <p className="text-sm font-medium tabular-nums text-foreground">
        Total: {formatOrderTotal(order.subtotalCents)}
      </p>
      {copy ? (
        <p className="text-sm text-pretty text-muted-foreground">{copy}</p>
      ) : null}

      {order.status === 'awaiting_proof' ? (
        <div className="flex flex-col gap-4">
          <PaymentInstructions />
          <p className="text-xs text-muted-foreground text-pretty">
            Escribe la referencia{' '}
            <span className="font-mono text-foreground">
              {orderReference(order.id)}
            </span>{' '}
            en la transferencia.
          </p>
          <ProofUpload orderId={order.id} />
        </div>
      ) : null}

      <Button variant="outline" size="sm" render={<Link to="/" />}>
        Volver al catálogo
      </Button>
    </section>
  )
}
