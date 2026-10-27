import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCop, formatPresentationPrice } from '@/domain/product/types'
import { lineTotalCents, threadColorLabel } from '@/domain/cart/types'
import type { CartLine } from '@/domain/cart/types'
import { orderReference } from '@/domain/order/types'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { logEventSafe } from '@/shared/logging'
import { PaymentInstructions } from '@/features/checkout/PaymentInstructions'
import { ProofUpload } from '@/features/checkout/ProofUpload'
import { useCartActions, useCartLines, useCartSubtotalLabel } from '@/features/cart/useCart'
import { readPendingOrderId, savePendingOrderId } from '@/features/orders/pending-order'
import { useCreateOrder } from '@/features/orders/useOrders'

type Step = 'contact' | 'proof' | 'done'

function cartToOrderItems(lines: CartLine[]) {
  return lines.map((line) => ({
    productId: line.productId,
    beadSize: line.beadSize,
    productName: line.productName,
    presentationLabel: line.presentationLabel,
    unit: line.unit,
    priceCents: line.priceCents,
    quantity: line.quantity,
    threadColor: line.threadColor,
  }))
}

export function CheckoutPanel() {
  const navigate = useNavigate()
  const lines = useCartLines()
  const subtotalLabel = useCartSubtotalLabel()
  const { clearCart } = useCartActions()
  const createOrder = useCreateOrder()
  const pendingOrderId = readPendingOrderId()

  const [step, setStep] = useState<Step>('contact')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | undefined>()

  async function onCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(undefined)

    if (lines.length === 0) {
      setMessage('Tu carrito está vacío.')
      return
    }

    try {
      const id = await createOrder.mutateAsync({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        items: cartToOrderItems(lines),
      })
      logEventSafe({
        category: 'checkout',
        eventType: 'checkout_order_created',
        success: true,
        message: 'Pedido creado',
        email: email || undefined,
        entityType: 'order',
        entityId: id,
        detail: { phone, itemCount: lines.length },
      })
      savePendingOrderId(id)
      setOrderId(id)
      setStep('proof')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear el pedido.'
      logEventSafe({
        category: 'checkout',
        eventType: 'checkout_order_error',
        success: false,
        message: msg,
        email: email || undefined,
      })
      setMessage(msg)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para completar el pago.
      </p>
    )
  }

  if (lines.length === 0 && step !== 'done' && step !== 'proof') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
        {pendingOrderId ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link to={`/pedido/${pendingOrderId}`} />}
          >
            Retomar comprobante
          </Button>
        ) : null}
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Ver catálogo
        </Button>
      </div>
    )
  }

  if (step === 'done' && orderId) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <p className="text-base font-medium text-foreground">
          Comprobante enviado
        </p>
        <p className="text-sm text-pretty text-muted-foreground">
          Rafa revisará tu pago pronto. Si algo no coincide, te contactará al
          teléfono que dejaste.
        </p>
        <p className="text-xs text-muted-foreground">
          Referencia:{' '}
          <span className="font-mono">{orderReference(orderId)}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link to={`/pedido/${orderId}`} />}>
            Ver pedido
          </Button>
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Tu pedido</h2>
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li key={line.id} className="rounded-xl border p-3 text-sm">
              <p className="font-medium text-foreground">{line.productName}</p>
              <p className="text-xs text-muted-foreground">
                {line.presentationLabel}
                {line.threadColor
                  ? ` · ${threadColorLabel(line.threadColor)}`
                  : null}
              </p>
              <p className="tabular-nums text-foreground">
                {formatPresentationPrice(line.priceCents, line.unit)} ×{' '}
                {line.quantity} = {formatCop(lineTotalCents(line))}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-sm font-medium tabular-nums text-foreground">
          Total: {subtotalLabel}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {step === 'contact' ? (
          <form onSubmit={onCreateOrder} className="flex flex-col gap-3 rounded-xl border p-4">
            <h2 className="text-sm font-medium text-foreground">Datos de contacto</h2>
            {pendingOrderId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                render={<Link to={`/pedido/${pendingOrderId}`} />}
              >
                Retomar comprobante pendiente
              </Button>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-name" className="text-xs">
                Nombre
              </Label>
              <Input
                id="checkout-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-phone" className="text-xs">
                WhatsApp / teléfono
              </Label>
              <Input
                id="checkout-phone"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-email" className="text-xs">
                Correo (opcional)
              </Label>
              <Input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={createOrder.isPending}>
              Continuar al comprobante
            </Button>
            {message ? (
              <p className="text-xs text-destructive text-pretty">{message}</p>
            ) : null}
          </form>
        ) : orderId ? (
          <div className="flex flex-col gap-3 rounded-xl border p-4">
            <h2 className="text-sm font-medium text-foreground">
              Sube el comprobante
            </h2>
            <PaymentInstructions />
            <p className="text-xs text-muted-foreground text-pretty">
              Escribe la referencia{' '}
              <span className="font-mono text-foreground">
                {orderReference(orderId)}
              </span>{' '}
              en la transferencia. Rafa confirmará tu pedido.
            </p>
            <ProofUpload
              orderId={orderId}
              onUploaded={() => {
                clearCart()
                setStep('done')
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/pedido/${orderId}`)}
            >
              Subir después
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
