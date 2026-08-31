import { Link } from 'react-router'
import type { Showcase } from '@/domain/showcase/types'
import { CollageLayout } from '@/features/gallery/CollageLayout'

type ShowcaseCardProps = {
  showcase: Showcase
  to: string
}

export function ShowcaseCard({ showcase, to }: ShowcaseCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/40"
    >
      <CollageLayout
        template={showcase.template}
        images={showcase.images}
        title={showcase.title}
      />
      <div className="flex flex-col gap-1 border-t px-3 py-3">
        <p className="text-sm font-medium text-foreground">{showcase.title}</p>
        {showcase.caption ? (
          <p className="line-clamp-2 text-xs text-muted-foreground text-pretty">
            {showcase.caption}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
