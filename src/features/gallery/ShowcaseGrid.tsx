import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { ShowcaseCard } from '@/features/gallery/ShowcaseCard'
import { ShowcaseCarousel } from '@/features/gallery/ShowcaseCarousel'
import {
  usePublishedShowcase,
  usePublishedShowcases,
} from '@/features/gallery/useShowcases'

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
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <li
            key={index}
            className="aspect-[4/5] animate-pulse rounded-xl bg-muted"
          />
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
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Sin trabajos aún</CardTitle>
          <CardDescription className="text-xs">
            Cuando Rafa publique fotos, aparecerán aquí en carrusel.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    return <div className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-pretty">
        {error instanceof Error ? error.message : 'No se pudo cargar el trabajo.'}
      </p>
    )
  }

  if (!showcase) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trabajo no encontrado</CardTitle>
          <CardDescription className="text-xs">
            Puede que ya no esté publicado.
          </CardDescription>
        </CardHeader>
        <div className="px-4 pb-4">
          <Button variant="outline" size="sm" render={<Link to="/galeria" />}>
            <ArrowLeft data-icon="inline-start" />
            Volver a la galería
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <ShowcaseCarousel
        images={showcase.images}
        title={showcase.title}
        aspectClassName="aspect-[4/5] sm:aspect-[3/4]"
        className="mx-auto w-full max-w-lg"
      />

      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-base text-balance">{showcase.title}</CardTitle>
          {showcase.caption ? (
            <CardDescription className="text-sm text-pretty">
              {showcase.caption}
            </CardDescription>
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
        </CardHeader>
        <div className="px-4 pb-4">
          <Button variant="outline" size="sm" render={<Link to="/galeria" />}>
            <ArrowLeft data-icon="inline-start" />
            Volver a la galería
          </Button>
        </div>
      </Card>
    </div>
  )
}
