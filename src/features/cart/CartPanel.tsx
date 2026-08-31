import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  formatPresentationPrice,
  formatCop,
} from '@/domain/product/types'
import {
  isLooseBeadUnit,
  lineTotalCents,
  threadColorLabel,
  type CartLine,
} from '@/domain/cart/types'
import { useCatalogProducts } from '@/features/catalog/useProducts'
import {
  useCartActions,
  useCartLines,
  useCartSubtotalLabel,
} from '@/features/cart/useCart'

function CartLineRow({
  line,
  stockQty,
  onQuantityChange,
  onRemove,
}: {
  line: CartLine
  stockQty: number
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  const loose = isLooseBeadUnit(line.unit)

  return (
    <article className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{line.productName}</p>
        <p className="text-xs text-muted-foreground">{line.presentationLabel}</p>
        {line.threadColor ? (
          <p className="text-xs text-muted-foreground">
            {threadColorLabel(line.threadColor)}
          </p>
        ) : null}
        <p className="text-sm tabular-nums text-foreground">
          {formatPresentationPrice(line.priceCents, line.unit)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {loose ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Quitar una unidad"
              onClick={() => onQuantityChange(line.quantity - 1)}
            >
              −
            </Button>
            <span className="min-w-8 text-center text-sm tabular-nums">
              {line.quantity}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Agregar una unidad"
              disabled={line.quantity >= stockQty}
              onClick={() => onQuantityChange(line.quantity + 1)}
            >
              +
            </Button>
            <span className="text-xs text-muted-foreground">
              Stock: {stockQty}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Cantidad: 1</span>
        )}

        <div className="flex items-center gap-2">
          <p className="text-sm font-medium tabular-nums text-foreground">
            {formatCop(lineTotalCents(line))}
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            Quitar
          </Button>
        </div>
      </div>
    </article>
  )
}

export function CartPanel({ onClose }: { onClose?: () => void } = {}) {
  const lines = useCartLines()
  const subtotalLabel = useCartSubtotalLabel()
  const { setQuantity, removeLine, clearCart } = useCartActions()
  const productsQuery = useCatalogProducts()

  const stockByProductId = new Map(
    productsQuery.data?.map((product) => [product.id, product.stockQty]) ?? [],
  )

  if (lines.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
        {onClose ? (
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Ver catálogo
          </Button>
        ) : (
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Ver catálogo
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.id}>
            <CartLineRow
              line={line}
              stockQty={stockByProductId.get(line.productId) ?? 0}
              onQuantityChange={(quantity) =>
                setQuantity(
                  line.id,
                  quantity,
                  stockByProductId.get(line.productId) ?? 0,
                )
              }
              onRemove={() => removeLine(line.id)}
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="text-base font-medium tabular-nums text-foreground">
            {subtotalLabel}
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-pretty">
          El pago con comprobante y plan separe llegan en la siguiente fase.
          Por ahora puedes armar el pedido y revisar el total.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled>
            Ir a pagar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => clearCart()}
          >
            Vaciar carrito
          </Button>
          {onClose ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Seguir comprando
            </Button>
          ) : (
            <Button variant="ghost" size="sm" render={<Link to="/" />}>
              Seguir comprando
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
