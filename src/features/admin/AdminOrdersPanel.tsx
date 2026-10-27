import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ORDER_STATUSES,
  formatOrderTotal,
  orderReference,
  orderStatusLabel,
  type Order,
  type OrderStatus,
} from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { OrderLines } from '@/features/orders/OrderLines'
import {
  useAdminOrders,
  useCancelOrder,
  useMarkOrderDelivered,
  useSetOrderAdminNotes,
} from '@/features/orders/useOrders'

function OrderCard({ order }: { order: Order }) {
  const cancelOrder = useCancelOrder()
  const markDelivered = useMarkOrderDelivered()
  const saveNotes = useSetOrderAdminNotes()
  const [notes, setNotes] = useState(order.adminNotes ?? '')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [message, setMessage] = useState<string | undefined>()
  const canCancel =
    order.status === 'awaiting_proof' || order.status === 'review'
  const canDeliver = order.status === 'approved'

  async function onCancel() {
    setMessage(undefined)
    try {
      await cancelOrder.mutateAsync(order.id)
      setConfirmCancel(false)
      setMessage('Pedido cancelado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cancelar.')
    }
  }

  async function onDeliver() {
    setMessage(undefined)
    try {
      await markDelivered.mutateAsync(order.id)
      setMessage('Marcado como entregado.')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'No se pudo marcar entregado.',
      )
    }
  }

  async function onSaveNotes() {
    setMessage(undefined)
    try {
      await saveNotes.mutateAsync({ orderId: order.id, notes })
      setMessage('Nota guardada.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la nota.')
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {order.customerPhone}
            {order.customerEmail ? ` · ${order.customerEmail}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleString('es-CO')} ·{' '}
            {orderStatusLabel(order.status)} ·{' '}
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
          Rechazo: {order.latestProof.rejectionReason}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`notes-${order.id}`} className="text-xs">
          Nota interna
        </Label>
        <textarea
          id={`notes-${order.id}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          className="min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saveNotes.isPending}
          onClick={() => void onSaveNotes()}
        >
          Guardar nota
        </Button>
      </div>

      {canDeliver ? (
        <Button
          type="button"
          size="sm"
          disabled={markDelivered.isPending}
          onClick={() => void onDeliver()}
        >
          Marcar entregado
        </Button>
      ) : null}

      {canCancel && !confirmCancel ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setConfirmCancel(true)}
        >
          Cancelar pedido
        </Button>
      ) : null}

      {canCancel && confirmCancel ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={cancelOrder.isPending}
            onClick={() => void onCancel()}
          >
            Confirmar cancelación
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmCancel(false)}
          >
            Volver
          </Button>
        </div>
      ) : null}

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </article>
  )
}

export function AdminOrdersPanel() {
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const query = useAdminOrders(status)

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para ver los pedidos.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order-status-filter" className="text-xs">
          Estado
        </Label>
        <Select
          value={status || 'all'}
          onValueChange={(value) =>
            setStatus(!value || value === 'all' ? '' : (value as OrderStatus))
          }
        >
          <SelectTrigger id="order-status-filter" className="w-full md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {ORDER_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {orderStatusLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : query.isError ? (
        <p className="text-sm text-destructive text-pretty">
          {query.error instanceof Error
            ? query.error.message
            : 'No se pudieron cargar los pedidos.'}
        </p>
      ) : !query.data?.length ? (
        <p className="text-sm text-muted-foreground">No hay pedidos en este filtro.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {query.data.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
