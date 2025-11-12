"use client"

import { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import SurfaceMesh from "../SurfaceMesh"

type Props = {
  expression: (x: number, y: number, t: number) => number
  range?: number
  segmentsX?: number
  segmentsY?: number
  vectors?: number
  t?: number
  vectorScale?: number
  step?: number
  height?: number
}

function GradientArrows({
  expression,
  range,
  vectors,
  t,
  vectorScale,
  step,
}: {
  expression: (x: number, y: number, t: number) => number
  range: number
  vectors: number
  t: number
  vectorScale: number
  step: number
}) {
  const arrows = useMemo(() => {
    const result: Array<{ position: THREE.Vector3; direction: THREE.Vector3; length: number }> = []
    const n = Math.max(2, vectors)

    for (let i = 0; i < n; i++) {
      const xi = -range + (2 * range * i) / (n - 1)
      for (let j = 0; j < n; j++) {
        const yj = -range + (2 * range * j) / (n - 1)

        const fx = (expression(xi + step, yj, t) - expression(xi - step, yj, t)) / (2 * step)
        const fy = (expression(xi, yj + step, t) - expression(xi, yj - step, t)) / (2 * step)

        const v = new THREE.Vector3(fx, 0, fy)
        const length = v.length()

        if (Number.isFinite(length) && length > 1e-9) {
          result.push({
            position: new THREE.Vector3(xi, 0, yj),
            direction: v.clone().normalize(),
            length: Math.min(range * 0.35, length * vectorScale),
          })
        }
      }
    }
    return result
  }, [expression, range, vectors, t, vectorScale, step])

  return (
    <group>
      {arrows.map((arrow, i) => (
        <arrowHelper key={i} args={[arrow.direction, arrow.position, arrow.length, 0x0033cc, 0.15, 0.1]} />
      ))}
    </group>
  )
}

export default function GradientField3D({
  expression,
  range = 4,
  segmentsX = 120,
  segmentsY = 120,
  vectors = 16,
  t = 0,
  vectorScale = 0.5,
  step = 1e-3,
  height = 0,
}: Props) {
  const surfaceFn = useMemo(() => {
    return (x: number, y: number) => {
      const value = expression(x, y, t) + height
      return Number.isFinite(value) ? value : 0
    }
  }, [expression, t, height])

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 420, position: "relative" }}>
      <Canvas camera={{ position: [9, 9, 9], fov: 45 }}>
        <color attach="background" args={["#ffffff"]} />
        <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#444444" />
        <directionalLight position={[5, 6, 4]} intensity={0.8} />
        <gridHelper args={[range * 2, 20, 0x888888, 0xdddddd]} material-transparent material-opacity={0.7} />
        <axesHelper args={[range * 1.2]} material-transparent material-opacity={0.35} />
        <SurfaceMesh
          f={surfaceFn}
          xMin={-range}
          xMax={range}
          yMin={-range}
          yMax={range}
          segmentsX={segmentsX}
          segmentsY={segmentsY}
          color="#ffa24d"
        />
        <GradientArrows
          expression={expression}
          range={range}
          vectors={vectors}
          t={t}
          vectorScale={vectorScale}
          step={step}
        />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  )
}
