import { formatCop } from '@/domain/product/types'
import type { BeadSize } from '@/domain/product/types'

export type ThreadColor = 'negro' | 'rojo' | 'gris'

export type CartLine = {
  id: string
  productId: string
  beadSize: BeadSize
  productName: string
  presentationLabel: string
  priceCents: number
  unit: string | null
  quantity: number
  threadColor: ThreadColor | null
}

export type AddCartLineInput = {
  productId: string
  beadSize: BeadSize
  productName: string
  presentationLabel: string
  priceCents: number | null
  unit: string | null
  stockQty: number
  quantity?: number
  threadColor?: ThreadColor | null
}

export function isLooseBeadUnit(unit: string | null): boolean {
  return unit === 'c/u'
}

export function canAddPresentation(
  priceCents: number | null,
  unit: string | null,
  stockQty: number,
): boolean {
  if (priceCents === null) return false
  if (isLooseBeadUnit(unit)) return stockQty > 0
  return true
}

export function addBlockedReason(
  priceCents: number | null,
  unit: string | null,
  stockQty: number,
): string | null {
  if (priceCents === null) return 'Este producto aún no tiene precio.'
  if (isLooseBeadUnit(unit) && stockQty <= 0) {
    return 'Sin stock de balines sueltos. Prueba otra presentación.'
  }
  return null
}

export function findDefaultPresentationIndex(
  presentations: { priceCents: number | null; unit: string | null }[],
  stockQty: number,
): number {
  const index = presentations.findIndex((item) =>
    canAddPresentation(item.priceCents, item.unit, stockQty),
  )
  return index >= 0 ? index : 0
}

export function cartLineKey(line: Pick<
  CartLine,
  'productId' | 'presentationLabel' | 'threadColor'
>): string {
  return `${line.productId}:${line.presentationLabel}:${line.threadColor ?? ''}`
}

export function lineTotalCents(line: CartLine): number {
  return line.priceCents * line.quantity
}

export function cartSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotalCents(line), 0)
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function formatCartSubtotal(lines: CartLine[]): string {
  return formatCop(cartSubtotalCents(lines))
}

export function threadColorLabel(color: ThreadColor): string {
  switch (color) {
    case 'negro':
      return 'Hilo negro'
    case 'rojo':
      return 'Hilo rojo'
    case 'gris':
      return 'Hilo gris'
  }
}

export type AddToCartResult =
  | { ok: true }
  | { ok: false; message: string }

export function validateAddToCart(input: AddCartLineInput): AddToCartResult {
  if (input.priceCents === null) {
    return { ok: false, message: 'Este producto aún no tiene precio.' }
  }

  const quantity = input.quantity ?? 1
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, message: 'Cantidad inválida.' }
  }

  if (isLooseBeadUnit(input.unit)) {
    if (input.stockQty <= 0) {
      return { ok: false, message: 'No hay stock de balines.' }
    }
    if (quantity > input.stockQty) {
      return {
        ok: false,
        message: `Solo hay ${input.stockQty} balines disponibles.`,
      }
    }
  } else if (quantity !== 1) {
    return { ok: false, message: 'Esta presentación solo permite 1 unidad.' }
  }

  return { ok: true }
}

export function maxQuantityForLine(
  line: CartLine,
  stockQty: number,
): number {
  if (isLooseBeadUnit(line.unit)) {
    return Math.max(0, stockQty)
  }
  return 1
}
