import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float } from '@react-three/drei'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group } from 'three'
import type { BeadSize } from '@/domain/product/types'

const THREAD = {
  negro: '#1a1a1a',
  rojo: '#9b1c1c',
  gris: '#8a9199',
} as const

export type ThreadColor = keyof typeof THREAD

type BeadStrandProps = {
  beadSize: BeadSize
  threadColor?: ThreadColor
  autoRotate?: boolean
  interactive?: boolean
}

function beadRadius(beadSize: BeadSize): number {
  return 0.065 + (beadSize - 3) * 0.02
}

function BeadStrand({
  beadSize,
  threadColor = 'negro',
  autoRotate = true,
}: BeadStrandProps) {
  const group = useRef<Group>(null)
  const radius = beadRadius(beadSize)
  const count = 9

  const { positions, tube } = useMemo(() => {
    const items: Vector3[] = []
    const arc = Math.PI * 0.95
    const curveRadius = 0.62
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1)
      const angle = -arc / 2 + t * arc
      items.push(
        new Vector3(
          Math.sin(angle) * curveRadius,
          Math.cos(angle) * curveRadius * 0.22,
          Math.cos(angle) * curveRadius * 0.35,
        ),
      )
    }
    const curve = new CatmullRomCurve3(items)
    return {
      positions: items.map((v) => [v.x, v.y, v.z] as [number, number, number]),
      tube: new TubeGeometry(curve, 64, 0.012, 8, false),
    }
  }, [count])

  useFrame((_, delta) => {
    if (!autoRotate || !group.current) return
    group.current.rotation.y += delta * 0.4
    group.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.08
  })

  return (
    <group ref={group} position={[0, 0.02, 0]} scale={0.88}>
      <mesh geometry={tube}>
        <meshStandardMaterial
          color={THREAD[threadColor]}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {positions.map((position, index) => (
        <mesh key={index} position={position} castShadow>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color="#d8b45a"
            metalness={0.95}
            roughness={0.22}
            envMapIntensity={1.2}
          />
        </mesh>
      ))}
    </group>
  )
}

export function BeadSceneContent({
  beadSize,
  threadColor = 'negro',
  autoRotate = true,
}: BeadStrandProps) {
  return (
    <>
      <color attach="background" args={['#eef2f7']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
        <BeadStrand
          beadSize={beadSize}
          threadColor={threadColor}
          autoRotate={autoRotate}
        />
      </Float>
      <ContactShadows
        position={[0, -0.75, 0]}
        opacity={0.35}
        scale={6}
        blur={2.5}
        far={2}
      />
      <Environment preset="studio" />
    </>
  )
}
