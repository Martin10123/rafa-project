import type { ShowcaseImage, ShowcaseTemplate } from '@/domain/showcase/types'
import { templateSlotCount } from '@/domain/showcase/types'

type CollageLayoutProps = {
  template: ShowcaseTemplate
  images: ShowcaseImage[]
  title: string
}

function gridClass(template: ShowcaseTemplate): string {
  switch (template) {
    case 'single':
      return 'grid-cols-1'
    case 'two_col':
      return 'grid-cols-2'
    case 'three_row':
      return 'grid-cols-3'
    case 'grid_2x2':
      return 'grid-cols-2 grid-rows-2'
  }
}

export function CollageLayout({ template, images, title }: CollageLayoutProps) {
  const slots = templateSlotCount(template)
  const cells = Array.from({ length: slots }, (_, index) => images[index] ?? null)

  return (
    <div className={`grid gap-1 overflow-hidden rounded-xl ${gridClass(template)}`}>
      {cells.map((image, index) => (
        <div
          key={image?.id ?? `empty-${index}`}
          className="relative aspect-square overflow-hidden bg-muted"
        >
          {image ? (
            <img
              src={image.imageUrl}
              alt={image.altText ?? title}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              —
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
