import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  formatOrderTotal,
  orderStatusLabel,
} from '@/domain/order/types'
import { formatPresentationPrice } from '@/domain/product/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { logEventSafe } from '@/shared/logging'
import {
  usePendingPaymentReviews,
  useReviewPaymentProof,
} from '@/features/orders/useOrders'

export function PaymentsPanel() {
  const reviewsQuery = usePendingPaymentReviews()
  const reviewProof = useReviewPaymentProof()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [message, setMessage] = useState<string | undefined>()

  async function onApprove(proofId: string) {
    setMessage(undefined)
    try {
      await reviewProof.mutateAsync({ proofId, approve: true })
      logEventSafe({
        category: 'orders',
        eventType: 'order_payment_approved',
        success: true,
        message: 'Pago aprobado',
        entityType: 'payment_proof',
        entityId: proofId,
      })
      setMessage('Pago aprobado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo aprobar.')
    }
  }

  async function onReject(proofId: string) {
    setMessage(undefined)
    try {
      await reviewProof.mutateAsync({
        proofId,
        approve: false,
        rejectionReason: rejectReason,
      })
      logEventSafe({
        category: 'orders',
        eventType: 'order_payment_rejected',
        success: true,
        message: rejectReason || 'Pago rechazado',
        entityType: 'payment_proof',
        entityId: proofId,
      })
      setRejectingId(null)
      setRejectReason('')
      setMessage('Pago rechazado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo rechazar.')
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para revisar pagos.
      </p>
    )
  }

  if (reviewsQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />
  }

  if (reviewsQuery.isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {reviewsQuery.error instanceof Error
          ? reviewsQuery.error.message
          : 'No se pudieron cargar los pagos.'}
      </p>
    )
  }

  if (!reviewsQuery.data?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay comprobantes pendientes de revisión.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
      {reviewsQuery.data.map((order) => {
        const proof = order.latestProof
        if (!proof) return null

        return (
          <article
            key={order.id}
            className="flex flex-col gap-4 rounded-xl border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {order.customerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.customerPhone}
                  {order.customerEmail ? ` · ${order.customerEmail}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString('es-CO')} ·{' '}
                  {orderStatusLabel(order.status)}
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums text-foreground">
                {formatOrderTotal(order.subtotalCents)}
              </p>
            </div>

            <ul className="flex flex-col gap-1 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="text-muted-foreground">
                  {item.productName} — {item.presentationLabel} × {item.quantity}{' '}
                  ({formatPresentationPrice(item.priceCents, item.unit)})
                </li>
              ))}
            </ul>

            {proof.imageUrl ? (
              <a
                href={proof.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl border"
              >
                <img
                  src={proof.imageUrl}
                  alt="Comprobante de pago"
                  className="max-h-80 w-full object-contain bg-muted"
                />
              </a>
            ) : (
              <p className="text-xs text-destructive">
                No se pudo cargar la imagen del comprobante.
              </p>
            )}

            {rejectingId === proof.id ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`reject-${proof.id}`} className="text-xs">
                  Motivo del rechazo (opcional)
                </Label>
                <Input
                  id={`reject-${proof.id}`}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Ej. monto no coincide"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={reviewProof.isPending}
                    onClick={() => void onReject(proof.id)}
                  >
                    Confirmar rechazo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRejectingId(null)
                      setRejectReason('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={reviewProof.isPending}
                  onClick={() => void onApprove(proof.id)}
                >
                  Aprobar pago
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={reviewProof.isPending}
                  onClick={() => setRejectingId(proof.id)}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
