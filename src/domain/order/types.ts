import { formatCop } from '@/domain/product/types'

export const ORDER_STATUSES = [
  'awaiting_proof',
  'review',
  'approved',
  'rejected',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

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
  items: OrderItem[]
  latestProof: PaymentProof | null
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
