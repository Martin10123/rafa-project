import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { ShowcaseCard } from '@/features/gallery/ShowcaseCard'
import {
  usePublishedShowcase,
  usePublishedShowcases,
} from '@/features/gallery/useShowcases'
import { CollageLayout } from '@/features/gallery/CollageLayout'

export function ShowcaseGrid() {
  const { data, isLoading, isError, error } = usePublishedShowcases()

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Configura Supabase para ver la galería.
      </p>
    )
  }

  if (isLoading) {
    return (
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="h-56 animate-pulse rounded-xl bg-muted" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {error instanceof Error ? error.message : 'No se pudo cargar la galería.'}
      </p>
    )
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        Todavía no hay trabajos publicados.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {data.map((showcase) => (
        <li key={showcase.id}>
          <ShowcaseCard showcase={showcase} to={`/galeria/${showcase.id}`} />
        </li>
      ))}
    </ul>
  )
}

type ShowcaseDetailProps = {
  showcaseId: string
}

export function ShowcaseDetailView({ showcaseId }: ShowcaseDetailProps) {
  const { data: showcase, isLoading, isError, error } =
    usePublishedShowcase(showcaseId || null)

  if (isLoading) {
    return <div className="aspect-square animate-pulse rounded-xl bg-muted" />
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {error instanceof Error ? error.message : 'No se pudo cargar el collage.'}
      </p>
    )
  }

  if (!showcase) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Collage no encontrado.</p>
        <Button variant="outline" size="sm" render={<Link to="/galeria" />}>
          Volver a la galería
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <CollageLayout
        template={showcase.template}
        images={showcase.images}
        title={showcase.title}
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-medium text-balance text-foreground">
          {showcase.title}
        </h1>
        {showcase.caption ? (
          <p className="text-sm text-pretty text-muted-foreground">
            {showcase.caption}
          </p>
        ) : null}
        {showcase.beadSize !== null ? (
          <p className="text-xs text-muted-foreground">
            Referencia:{' '}
            <Link
              to={`/producto/${showcase.beadSize}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Balín #{showcase.beadSize}
            </Link>
          </p>
        ) : null}
      </div>
      <Button variant="outline" size="sm" render={<Link to="/galeria" />}>
        Volver a la galería
      </Button>
    </div>
  )
}
