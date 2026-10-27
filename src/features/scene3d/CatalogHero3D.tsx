import { BeadViewerSuspense } from '@/features/scene3d/BeadViewerLazy'

export function CatalogHero3D() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_80px_-40px] shadow-sky-400/50 backdrop-blur-xl">
      <div className="h-56 sm:h-72">
        <BeadViewerSuspense
          beadSize={5}
          threadColor="negro"
          interactive
          autoRotate
        />
      </div>
      <div className="border-t px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Vista previa
        </p>
        <p className="text-sm text-foreground">
          Balines en oro 18k — gira y haz zoom
        </p>
      </div>
    </div>
  )
}
