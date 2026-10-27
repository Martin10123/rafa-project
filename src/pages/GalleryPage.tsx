import { ShowcaseGrid } from '@/features/gallery/ShowcaseGrid'

export function GalleryPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex max-w-xl flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.22em] text-sky-200 uppercase">
          Galería
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
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
