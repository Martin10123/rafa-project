import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatus,
  PaymentProof,
  ProofStatus,
} from '@/domain/order/types'
import { supabase } from '@/data/supabase/client'

const PROOF_BUCKET = 'payment-proofs'

type OrderRow = {
  id: string
  user_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  status: string
  subtotal_cents: number
  created_at: string
  order_items: ItemRow[] | null
  payment_proofs: ProofRow[] | null
}

type ItemRow = {
  id: string
  order_id: string
  product_id: string | null
  bead_size: number | null
  product_name: string
  presentation_label: string
  unit: string | null
  price_cents: number
  quantity: number
  thread_color: string | null
  line_total_cents: number
}

type ProofRow = {
  id: string
  order_id: string
  storage_path: string
  status: string
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
}

const ORDER_SELECT = `
  id,
  user_id,
  customer_name,
  customer_phone,
  customer_email,
  status,
  subtotal_cents,
  created_at,
  order_items (
    id,
    order_id,
    product_id,
    bead_size,
    product_name,
    presentation_label,
    unit,
    price_cents,
    quantity,
    thread_color,
    line_total_cents
  ),
  payment_proofs (
    id,
    order_id,
    storage_path,
    status,
    rejection_reason,
    submitted_at,
    reviewed_at
  )
`

function assertClient() {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }
  return supabase
}

function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === 'awaiting_proof' ||
    value === 'review' ||
    value === 'approved' ||
    value === 'rejected' ||
    value === 'cancelled'
  )
}

function isProofStatus(value: string): value is ProofStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

function mapItem(row: ItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    beadSize: row.bead_size,
    productName: row.product_name,
    presentationLabel: row.presentation_label,
    unit: row.unit,
    priceCents: row.price_cents,
    quantity: row.quantity,
    threadColor: row.thread_color,
    lineTotalCents: row.line_total_cents,
  }
}

async function proofImageUrl(storagePath: string): Promise<string | null> {
  const client = assertClient()
  const { data, error } = await client.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(storagePath, 3600)

  if (error) return null
  return data.signedUrl
}

function mapProof(row: ProofRow, imageUrl: string | null = null): PaymentProof {
  if (!isProofStatus(row.status)) {
    throw new Error(`Estado de comprobante inválido: ${row.status}`)
  }

  return {
    id: row.id,
    orderId: row.order_id,
    storagePath: row.storage_path,
    imageUrl,
    status: row.status,
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
  }
}

function mapOrder(row: OrderRow, proofUrls: Map<string, string | null>): Order {
  if (!isOrderStatus(row.status)) {
    throw new Error(`Estado de pedido inválido: ${row.status}`)
  }

  const proofs = (row.payment_proofs ?? []).sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  )
  const latestProofRow = proofs[0] ?? null
  const latestProof = latestProofRow
    ? mapProof(latestProofRow, proofUrls.get(latestProofRow.storage_path) ?? null)
    : null

  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    status: row.status,
    subtotalCents: row.subtotal_cents,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map(mapItem),
    latestProof,
  }
}

async function mapOrdersWithProofUrls(rows: OrderRow[]): Promise<Order[]> {
  const paths = new Set<string>()
  for (const row of rows) {
    for (const proof of row.payment_proofs ?? []) {
      paths.add(proof.storage_path)
    }
  }

  const proofUrls = new Map<string, string | null>()
  await Promise.all(
    [...paths].map(async (path) => {
      proofUrls.set(path, await proofImageUrl(path))
    }),
  )

  return rows.map((row) => mapOrder(row, proofUrls))
}

export async function createStoreOrder(input: CreateOrderInput): Promise<string> {
  const client = assertClient()

  const { data, error } = await client.rpc('create_store_order', {
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail ?? null,
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      bead_size: item.beadSize,
      product_name: item.productName,
      presentation_label: item.presentationLabel,
      unit: item.unit,
      price_cents: item.priceCents,
      quantity: item.quantity,
      thread_color: item.threadColor,
    })),
  })

  if (error) throw new Error(error.message)
  return data as string
}

export async function uploadPaymentProofFile(
  orderId: string,
  file: File,
): Promise<string> {
  const client = assertClient()

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `${orderId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await client.storage
    .from(PROOF_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) throw new Error(uploadError.message)
  return storagePath
}

export async function submitPaymentProof(
  orderId: string,
  file: File,
): Promise<string> {
  const storagePath = await uploadPaymentProofFile(orderId, file)
  const client = assertClient()

  const { data, error } = await client.rpc('submit_payment_proof', {
    p_order_id: orderId,
    p_storage_path: storagePath,
  })

  if (error) {
    await client.storage.from(PROOF_BUCKET).remove([storagePath])
    throw new Error(error.message)
  }

  return data as string
}

export async function listPendingPaymentReviews(): Promise<Order[]> {
  const client = assertClient()

  const { data, error } = await client
    .from('orders')
    .select(ORDER_SELECT)
    .eq('status', 'review')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return mapOrdersWithProofUrls(data as OrderRow[])
}

export async function reviewPaymentProof(
  proofId: string,
  approve: boolean,
  rejectionReason?: string,
): Promise<void> {
  const client = assertClient()

  const { error } = await client.rpc('review_payment_proof', {
    p_proof_id: proofId,
    p_approve: approve,
    p_rejection_reason: rejectionReason ?? null,
  })

  if (error) throw new Error(error.message)
}
