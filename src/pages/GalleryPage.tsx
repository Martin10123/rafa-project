import { ShowcaseGrid } from '@/features/gallery/ShowcaseGrid'

export function GalleryPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex max-w-xl flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Galería
        </p>
        <h1 className="text-base font-medium text-balance text-foreground">
          Trabajos realizados
        </h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Desliza cada carrusel para ver las fotos. Toca un trabajo para verlo
          en grande.
        </p>
      </div>
      <ShowcaseGrid />
    </section>
  )
}
