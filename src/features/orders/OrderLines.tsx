import { formatPresentationPrice } from '@/domain/product/types'
import { threadColorLabel, type ThreadColor } from '@/domain/cart/types'
import type { CheckoutOrderItem } from '@/domain/order/types'

function threadLabel(color: string | null): string | null {
  if (color === 'negro' || color === 'rojo' || color === 'gris') {
    return threadColorLabel(color as ThreadColor)
  }
  return color
}

export function OrderLines({ items }: { items: CheckoutOrderItem[] }) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {items.map((item) => {
        const color = threadLabel(item.threadColor)
        return (
          <li key={item.id} className="text-muted-foreground">
            {item.productName} — {item.presentationLabel}
            {color ? ` · ${color}` : ''} × {item.quantity} (
            {formatPresentationPrice(item.priceCents, item.unit)})
          </li>
        )
      })}
    </ul>
  )
}
