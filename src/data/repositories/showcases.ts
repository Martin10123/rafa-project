import type {
  CreateShowcaseInput,
  Showcase,
  ShowcaseImage,
  UpdateShowcaseInput,
} from '@/domain/showcase/types'
import { isBeadSize, type BeadSize } from '@/domain/product/types'
import { isShowcaseTemplate } from '@/domain/showcase/types'
import { supabase } from '@/data/supabase/client'

const BUCKET = 'showcases'

type ShowcaseRow = {
  id: string
  title: string
  caption: string | null
  template: string
  sort_order: number
  is_published: boolean
  bead_size: number | null
  created_at: string
  showcase_images: ImageRow[] | null
}

type ImageRow = {
  id: string
  showcase_id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
}

const SHOWCASE_COLUMNS =
  'id, title, caption, template, sort_order, is_published, bead_size, created_at, showcase_images(id, showcase_id, storage_path, alt_text, sort_order)'

function publicImageUrl(storagePath: string): string {
  if (!supabase) return ''
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

function mapImage(row: ImageRow): ShowcaseImage {
  return {
    id: row.id,
    showcaseId: row.showcase_id,
    storagePath: row.storage_path,
    imageUrl: publicImageUrl(row.storage_path),
    altText: row.alt_text,
    sortOrder: row.sort_order,
  }
}

function mapShowcase(row: ShowcaseRow): Showcase {
  if (!isShowcaseTemplate(row.template)) {
    throw new Error(`Plantilla inválida: ${row.template}`)
  }

  const beadSize =
    row.bead_size !== null && isBeadSize(row.bead_size) ? row.bead_size : null

  const images = (row.showcase_images ?? [])
    .map(mapImage)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    template: row.template,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    beadSize,
    images,
    createdAt: row.created_at,
  }
}

function assertClient() {
  if (!supabase) {
    throw new Error('Falta configurar Supabase (.env.local).')
  }
  return supabase
}

export async function listPublishedShowcases(): Promise<Showcase[]> {
  const client = assertClient()

  const { data, error } = await client
    .from('showcases')
    .select(SHOWCASE_COLUMNS)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as ShowcaseRow[]).map(mapShowcase)
}

export async function getPublishedShowcase(id: string): Promise<Showcase | null> {
  const client = assertClient()

  const { data, error } = await client
    .from('showcases')
    .select(SHOWCASE_COLUMNS)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapShowcase(data as ShowcaseRow)
}

export async function listAdminShowcases(): Promise<Showcase[]> {
  const client = assertClient()

  const { data, error } = await client
    .from('showcases')
    .select(SHOWCASE_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as ShowcaseRow[]).map(mapShowcase)
}

export async function createShowcase(
  input: CreateShowcaseInput,
): Promise<Showcase> {
  const client = assertClient()

  const { data, error } = await client
    .from('showcases')
    .insert({
      title: input.title.trim(),
      caption: input.caption?.trim() || null,
      template: input.template,
      sort_order: input.sortOrder ?? 0,
      is_published: input.isPublished ?? false,
      bead_size: input.beadSize ?? null,
    })
    .select(SHOWCASE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return mapShowcase(data as ShowcaseRow)
}

export async function updateShowcase(
  id: string,
  input: UpdateShowcaseInput,
): Promise<Showcase> {
  const client = assertClient()

  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title.trim()
  if (input.caption !== undefined) patch.caption = input.caption?.trim() || null
  if (input.template !== undefined) patch.template = input.template
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder
  if (input.isPublished !== undefined) patch.is_published = input.isPublished
  if (input.beadSize !== undefined) patch.bead_size = input.beadSize

  const { data, error } = await client
    .from('showcases')
    .update(patch)
    .eq('id', id)
    .select(SHOWCASE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return mapShowcase(data as ShowcaseRow)
}

export async function deleteShowcase(id: string): Promise<void> {
  const client = assertClient()

  const { data: images, error: imagesError } = await client
    .from('showcase_images')
    .select('storage_path')
    .eq('showcase_id', id)

  if (imagesError) throw new Error(imagesError.message)

  const paths = (images ?? []).map((row) => row.storage_path as string)
  if (paths.length > 0) {
    const { error: storageError } = await client.storage
      .from(BUCKET)
      .remove(paths)
    if (storageError) throw new Error(storageError.message)
  }

  const { error } = await client.from('showcases').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function uploadShowcaseImage(
  showcaseId: string,
  file: File,
  sortOrder: number,
): Promise<ShowcaseImage> {
  const client = assertClient()

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const imageId = crypto.randomUUID()
  const storagePath = `${showcaseId}/${imageId}.${ext}`

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) throw new Error(uploadError.message)

  const { data, error } = await client
    .from('showcase_images')
    .insert({
      showcase_id: showcaseId,
      storage_path: storagePath,
      alt_text: file.name,
      sort_order: sortOrder,
    })
    .select('id, showcase_id, storage_path, alt_text, sort_order')
    .single()

  if (error) {
    await client.storage.from(BUCKET).remove([storagePath])
    throw new Error(error.message)
  }

  return mapImage(data as ImageRow)
}

export async function deleteShowcaseImage(image: ShowcaseImage): Promise<void> {
  const client = assertClient()

  const { error: storageError } = await client.storage
    .from(BUCKET)
    .remove([image.storagePath])

  if (storageError) throw new Error(storageError.message)

  const { error } = await client
    .from('showcase_images')
    .delete()
    .eq('id', image.id)

  if (error) throw new Error(error.message)
}

export function showcaseBeadSizeLabel(beadSize: BeadSize | null): string | null {
  return beadSize === null ? null : `Balín #${beadSize}`
}
