import { lazy, Suspense, type ComponentProps } from 'react'

const BeadViewerLazy = lazy(async () => {
  const mod = await import('@/features/scene3d/BeadViewer')
  return { default: mod.BeadViewer }
})

type Props = ComponentProps<typeof BeadViewerLazy>

export function BeadViewerSuspense(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex size-full min-h-48 items-center justify-center bg-muted text-xs text-muted-foreground">
          Cargando 3D…
        </div>
      }
    >
      <BeadViewerLazy {...props} />
    </Suspense>
  )
}
