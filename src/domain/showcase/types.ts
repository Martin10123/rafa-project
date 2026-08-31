import { isBeadSize, type BeadSize } from '@/domain/product/types'

export const SHOWCASE_TEMPLATES = [
  'single',
  'two_col',
  'three_row',
  'grid_2x2',
] as const

export type ShowcaseTemplate = (typeof SHOWCASE_TEMPLATES)[number]

export type ShowcaseImage = {
  id: string
  showcaseId: string
  storagePath: string
  imageUrl: string
  altText: string | null
  sortOrder: number
}

export type Showcase = {
  id: string
  title: string
  caption: string | null
  template: ShowcaseTemplate
  sortOrder: number
  isPublished: boolean
  beadSize: BeadSize | null
  images: ShowcaseImage[]
  createdAt: string
}

export type CreateShowcaseInput = {
  title: string
  caption?: string
  template: ShowcaseTemplate
  sortOrder?: number
  isPublished?: boolean
  beadSize?: BeadSize | null
}

export type UpdateShowcaseInput = {
  title?: string
  caption?: string | null
  template?: ShowcaseTemplate
  sortOrder?: number
  isPublished?: boolean
  beadSize?: BeadSize | null
}

export function isShowcaseTemplate(value: string): value is ShowcaseTemplate {
  return (SHOWCASE_TEMPLATES as readonly string[]).includes(value)
}

export function templateSlotCount(template: ShowcaseTemplate): number {
  switch (template) {
    case 'single':
      return 1
    case 'two_col':
      return 2
    case 'three_row':
      return 3
    case 'grid_2x2':
      return 4
  }
}

export function templateLabel(template: ShowcaseTemplate): string {
  switch (template) {
    case 'single':
      return '1 foto'
    case 'two_col':
      return '2 columnas'
    case 'three_row':
      return '3 en fila'
    case 'grid_2x2':
      return 'Cuadrícula 2×2'
  }
}

export function parseOptionalBeadSize(
  value: string,
): BeadSize | null | 'invalid' {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const num = Number(trimmed)
  if (!isBeadSize(num)) return 'invalid'
  return num
}
