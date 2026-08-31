import type {
  BeadSize,
  Product,
  ProductPresentation,
} from '@/domain/product/types'
import { isBeadSize } from '@/domain/product/types'
import { getStockMap } from '@/data/repositories/inventory'
import { supabase } from '@/data/supabase/client'

type PresentationRow = {
  label?: string
  price_cents?: number | null
  unit?: string | null
  image_url?: string | null
}

type ProductRow = {
  id: string
  bead_size: number
  name: string
  description: string | null
  approx_mm: number | null
  price_cents: number | null
  stock_qty: number
  is_active: boolean
  cover_image_url: string | null
  presentations: PresentationRow[] | null
}

const PRODUCT_COLUMNS =
  'id, bead_size, name, description, approx_mm, price_cents, stock_qty, is_active, cover_image_url, presentations'

function mapPresentation(row: PresentationRow): ProductPresentation {
  return {
    label: row.label ?? 'Presentación',
    priceCents: row.price_cents ?? null,
    unit: row.unit ?? null,
    imageUrl: row.image_url ?? null,
  }
}

function mapProduct(row: ProductRow, availableQty?: number): Product {
  if (!isBeadSize(row.bead_size)) {
    throw new Error(`Tamaño de balín inválido: ${row.bead_size}`)
  }

  return {
    id: row.id,
    beadSize: row.bead_size,
    name: row.name,
    description: row.description,
    approxMm: row.approx_mm === null ? null : Number(row.approx_mm),
    priceCents: row.price_cents,
    stockQty: availableQty ?? 0,
    isActive: row.is_active,
    coverImageUrl: row.cover_image_url,
    presentations: (row.presentations ?? []).map(mapPresentation),
  }
}

async function withStock(products: ProductRow[]): Promise<Product[]> {
  let stockMap = new Map<string, number>()
  try {
    stockMap = await getStockMap()
  } catch {
    // Vista aún no migrada: stock 0
  }
  return products.map((row) => mapProduct(row, stockMap.get(row.id) ?? 0))
}

export async function listCatalogProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .order('bead_size', { ascending: true })

  if (error) throw new Error(error.message)
  return withStock(data as ProductRow[])
}

export async function getProductByBeadSize(
  beadSize: BeadSize,
): Promise<Product | null> {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('bead_size', beadSize)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  const [product] = await withStock([data as ProductRow])
  return product
}

export async function listAdminProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .order('bead_size', { ascending: true })

  if (error) throw new Error(error.message)
  return withStock(data as ProductRow[])
}

export async function updateProductPrice(
  productId: string,
  priceCents: number | null,
): Promise<Product> {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }

  const { data, error } = await supabase
    .from('products')
    .update({ price_cents: priceCents })
    .eq('id', productId)
    .select(PRODUCT_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  const [product] = await withStock([data as ProductRow])
  return product
}
