import { ShowcaseGrid } from '@/features/gallery/ShowcaseGrid'

export function GalleryPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Inspiración
        </p>
        <h1 className="text-base font-medium text-balance text-foreground">
          Trabajos realizados
        </h1>
        <p className="max-w-xl text-sm text-pretty text-muted-foreground">
          Collages con manillas y diseños de Rafa. Sin Canva: todo vive aquí.
        </p>
      </div>
      <ShowcaseGrid />
    </section>
  )
}
