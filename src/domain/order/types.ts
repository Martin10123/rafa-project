import { formatCop } from '@/domain/product/types'

export const ORDER_STATUSES = [
  'awaiting_proof',
  'review',
  'approved',
  'rejected',
  'cancelled',
  'delivered',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

export function orderReference(id: string): string {
  return id.slice(0, 8)
}

export const PROOF_STATUSES = ['pending', 'approved', 'rejected'] as const

export type ProofStatus = (typeof PROOF_STATUSES)[number]

export type OrderItem = {
  id: string
  orderId: string
  productId: string | null
  beadSize: number | null
  productName: string
  presentationLabel: string
  unit: string | null
  priceCents: number
  quantity: number
  threadColor: string | null
  lineTotalCents: number
}

export type PaymentProof = {
  id: string
  orderId: string
  storagePath: string
  imageUrl: string | null
  status: ProofStatus
  rejectionReason: string | null
  submittedAt: string
  reviewedAt: string | null
}

export type Order = {
  id: string
  userId: string | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  status: OrderStatus
  subtotalCents: number
  createdAt: string
  adminNotes: string | null
  items: OrderItem[]
  latestProof: PaymentProof | null
}

export type CheckoutOrderItem = {
  id: string
  productName: string
  presentationLabel: string
  unit: string | null
  priceCents: number
  quantity: number
  threadColor: string | null
  lineTotalCents: number
}

export type CheckoutOrder = {
  id: string
  customerName: string
  status: OrderStatus
  subtotalCents: number
  createdAt: string
  rejectionReason: string | null
  items: CheckoutOrderItem[]
}

export type StorePaymentInfo = {
  bankName: string
  accountType: string
  accountNumber: string
  holderName: string
}

export function paymentInfoIsPublished(
  info: StorePaymentInfo | null | undefined,
): boolean {
  if (!info) return false
  return [info.bankName, info.accountType, info.accountNumber, info.holderName].some(
    (value) => value.trim() !== '',
  )
}

export type CreateOrderInput = {
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: CreateOrderItemInput[]
}

export type CreateOrderItemInput = {
  productId: string
  beadSize: number
  productName: string
  presentationLabel: string
  unit: string | null
  priceCents: number
  quantity: number
  threadColor: string | null
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'awaiting_proof':
      return 'Esperando comprobante'
    case 'review':
      return 'En revisión'
    case 'approved':
      return 'Aprobado'
    case 'rejected':
      return 'Rechazado'
    case 'cancelled':
      return 'Cancelado'
    case 'delivered':
      return 'Entregado'
  }
}

export function proofStatusLabel(status: ProofStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobado'
    case 'rejected':
      return 'Rechazado'
  }
}

export function formatOrderTotal(cents: number): string {
  return formatCop(cents)
}
