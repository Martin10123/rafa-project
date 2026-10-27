import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  formatOrderTotal,
  orderReference,
  orderStatusLabel,
} from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { OrderLines } from '@/features/orders/OrderLines'
import { useMyOrders } from '@/features/orders/useOrders'

export function OrdersPage() {
  const query = useMyOrders()

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Cuenta
        </p>
        <h1 className="text-base font-medium text-foreground">Mis pedidos</h1>
        <p className="max-w-xl text-sm text-pretty text-muted-foreground">
          Pedidos hechos con esta cuenta. Si compraste sin entrar, abre el
          enlace del comprobante.
        </p>
      </div>

      {!isSupabaseConfigured() ? (
        <p className="text-sm text-muted-foreground text-pretty">
          Configura Supabase para ver tu historial.
        </p>
      ) : query.isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : query.isError ? (
        <p className="text-sm text-destructive text-pretty">
          {query.error instanceof Error
            ? query.error.message
            : 'No se pudieron cargar tus pedidos.'}
        </p>
      ) : !query.data?.length ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Todavía no tienes pedidos.</p>
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Ver catálogo
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {query.data.map((order) => (
            <li key={order.id} className="flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {orderStatusLabel(order.status)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('es-CO')} ·{' '}
                    <span className="font-mono">{orderReference(order.id)}</span>
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums text-foreground">
                  {formatOrderTotal(order.subtotalCents)}
                </p>
              </div>
              <OrderLines items={order.items} />
              {order.status === 'rejected' && order.latestProof?.rejectionReason ? (
                <p className="text-xs text-destructive text-pretty">
                  {order.latestProof.rejectionReason}
                </p>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                render={<Link to={`/pedido/${order.id}`} />}
              >
                Ver pedido
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
