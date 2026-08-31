import { GalleryPanel } from '@/features/admin/GalleryPanel'

export function AdminGalleryPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Galería
        </p>
        <h1 className="text-base font-medium text-foreground">Collages</h1>
        <p className="max-w-xl text-sm text-muted-foreground text-pretty">
          Arma collages con tus fotos, elige plantilla y publícalos en la tienda.
        </p>
      </div>
      <GalleryPanel />
    </section>
  )
}
