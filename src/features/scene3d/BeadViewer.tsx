import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { BeadSize } from '@/domain/product/types'
import {
  BeadSceneContent,
  type ThreadColor,
} from '@/features/scene3d/BeadSceneContent'

type BeadViewerProps = {
  beadSize: BeadSize
  threadColor?: ThreadColor
  className?: string
  interactive?: boolean
  autoRotate?: boolean
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

export function BeadViewer({
  beadSize,
  threadColor = 'negro',
  className = '',
  interactive = true,
  autoRotate = true,
}: BeadViewerProps) {
  const reducedMotion = usePrefersReducedMotion()
  const shouldRotate = autoRotate && !reducedMotion

  const camera = useMemo(
    () => ({ position: [0, 0.25, 3.4] as [number, number, number], fov: 32 }),
    [],
  )

  return (
    <div className={`relative size-full min-h-48 overflow-hidden ${className}`}>
      <Suspense
        fallback={
          <div className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground">
            Cargando 3D…
          </div>
        }
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={camera}
          gl={{ antialias: true, alpha: false }}
          frameloop={shouldRotate || interactive ? 'always' : 'demand'}
        >
          <BeadSceneContent
            beadSize={beadSize}
            threadColor={threadColor}
            autoRotate={shouldRotate}
          />
          {interactive && !reducedMotion ? (
            <OrbitControls
              enablePan={false}
              enableZoom
              minDistance={2}
              maxDistance={5.5}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.7}
            />
          ) : null}
        </Canvas>
      </Suspense>
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground">
        {interactive && !reducedMotion
          ? 'Arrastra · rueda para zoom'
          : 'Vista 3D'}
      </p>
    </div>
  )
}
