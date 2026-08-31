import type {
  CreateMovementInput,
  InventoryMovement,
  MovementType,
  StockRow,
} from '@/domain/inventory/types'
import { supabase } from '@/data/supabase/client'

type StockRowDb = {
  product_id: string
  bead_size: number
  name: string
  physical_qty: number
  reserved_qty: number
  available_qty: number
}

type MovementRowDb = {
  id: string
  product_id: string
  type: MovementType
  quantity: number
  occurred_at: string
  source: string
  notes: string | null
  products: { bead_size: number; name: string } | null
}

function mapStock(row: StockRowDb): StockRow {
  return {
    productId: row.product_id,
    beadSize: row.bead_size,
    name: row.name,
    physicalQty: row.physical_qty,
    reservedQty: row.reserved_qty,
    availableQty: row.available_qty,
  }
}

function mapMovement(row: MovementRowDb): InventoryMovement {
  return {
    id: row.id,
    productId: row.product_id,
    beadSize: row.products?.bead_size ?? null,
    productName: row.products?.name ?? null,
    type: row.type,
    quantity: row.quantity,
    occurredAt: row.occurred_at,
    source: row.source,
    notes: row.notes,
  }
}

export async function listStockAvailable(): Promise<StockRow[]> {
  if (!supabase) throw new Error('Falta configurar Supabase (.env.local).')

  const { data, error } = await supabase
    .from('stock_available')
    .select('product_id, bead_size, name, physical_qty, reserved_qty, available_qty')
    .order('bead_size', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as StockRowDb[]).map(mapStock)
}

export async function listInventoryMovements(
  limit = 50,
): Promise<InventoryMovement[]> {
  if (!supabase) throw new Error('Falta configurar Supabase (.env.local).')

  const { data, error } = await supabase
    .from('inventory_movements')
    .select(
      'id, product_id, type, quantity, occurred_at, source, notes, products(bead_size, name)',
    )
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data as unknown as MovementRowDb[]).map(mapMovement)
}

export async function createInventoryMovement(
  input: CreateMovementInput,
  createdBy: string | null,
): Promise<void> {
  if (!supabase) throw new Error('Falta configurar Supabase (.env.local).')

  const { error } = await supabase.from('inventory_movements').insert({
    product_id: input.productId,
    type: input.type,
    quantity: input.quantity,
    occurred_at: input.occurredAt,
    source: 'manual',
    notes: input.notes?.trim() || null,
    created_by: createdBy,
  })

  if (error) throw new Error(error.message)
}

export async function getStockMap(): Promise<Map<string, number>> {
  const rows = await listStockAvailable()
  return new Map(rows.map((row) => [row.productId, row.availableQty]))
}
