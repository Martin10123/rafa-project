export type BeadSize = 3 | 4 | 5 | 6 | 7 | 8

export type ProductPresentation = {
  label: string
  priceCents: number | null
  unit: string | null
  imageUrl: string | null
}

export type Product = {
  id: string
  beadSize: BeadSize
  name: string
  description: string | null
  approxMm: number | null
  priceCents: number | null
  stockQty: number
  isActive: boolean
  coverImageUrl: string | null
  presentations: ProductPresentation[]
}

export function isBeadSize(value: number): value is BeadSize {
  return value >= 3 && value <= 8 && Number.isInteger(value)
}

export function formatCop(priceCents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(priceCents / 100)
}

export function formatPriceLabel(priceCents: number | null): string {
  return priceCents === null ? 'Precio por definir' : formatCop(priceCents)
}

export function formatPresentationPrice(
  priceCents: number | null,
  unit: string | null,
): string {
  const base = formatPriceLabel(priceCents)
  return unit ? `${base} ${unit}` : base
}

export function formatStockLabel(stockQty: number): string {
  if (stockQty <= 0) return 'Agotado'
  return `${stockQty} und.`
}

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100)
}

export function centsToPesos(cents: number): number {
  return cents / 100
}
