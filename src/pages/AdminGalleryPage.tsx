import { GalleryPanel } from '@/features/admin/GalleryPanel'

export function AdminGalleryPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex max-w-xl flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Galería
        </p>
        <h1 className="text-base font-medium text-foreground">Trabajos y fotos</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Sube fotos, ordénalas en carrusel y publícalas en la tienda.
        </p>
      </div>
      <GalleryPanel />
    </section>
  )
}
