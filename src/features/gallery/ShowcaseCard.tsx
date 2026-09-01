import { Link } from 'react-router'
import type { Showcase } from '@/domain/showcase/types'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShowcaseCarousel } from '@/features/gallery/ShowcaseCarousel'

type ShowcaseCardProps = {
  showcase: Showcase
  to: string
}

export function ShowcaseCard({ showcase, to }: ShowcaseCardProps) {
  const photoCount = showcase.images.length

  return (
    <Card className="gap-0 overflow-hidden py-0 ring-0 transition-shadow hover:shadow-md">
      <Link to={to} className="block">
        <div className="relative">
          <ShowcaseCarousel
            images={showcase.images}
            title={showcase.title}
            variant="compact"
          />
          {photoCount > 1 ? (
            <Badge
              variant="secondary"
              className="pointer-events-none absolute top-2 right-2 bg-background/85 backdrop-blur-sm"
            >
              {photoCount} fotos
            </Badge>
          ) : null}
        </div>
        <CardHeader className="gap-1 border-t py-3">
          <CardTitle className="text-sm">{showcase.title}</CardTitle>
          {showcase.caption ? (
            <CardDescription className="line-clamp-2 text-xs">
              {showcase.caption}
            </CardDescription>
          ) : null}
        </CardHeader>
        {showcase.beadSize !== null ? (
          <CardFooter className="border-t py-2 text-xs text-muted-foreground">
            Balín #{showcase.beadSize}
          </CardFooter>
        ) : null}
      </Link>
    </Card>
  )
}
