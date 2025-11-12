"use client"

import { useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import SurfaceMesh from "../SurfaceMesh"
import { compileExpression3D, type FnXYT } from "@/lib/math-expression"

type Props = {
  expression: string
  range: number
  segmentsX: number
  segmentsY: number
}

function AnimatedSurface({
  fn,
  range,
  segmentsX,
  segmentsY,
}: {
  fn: FnXYT
  range: number
  segmentsX: number
  segmentsY: number
}) {
  const [time, setTime] = useState(0)

  useFrame((_, delta) => {
    setTime((t) => t + delta)
  })

  const surfaceFn = useMemo(() => {
    return (x: number, y: number) => {
      const z = fn(x, y, time)
      return Number.isFinite(z) ? z : 0
    }
  }, [fn, time])

  return (
    <SurfaceMesh
      f={surfaceFn}
      xMin={-range}
      xMax={range}
      yMin={-range}
      yMax={range}
      segmentsX={segmentsX}
      segmentsY={segmentsY}
    />
  )
}

export default function SurfaceDraggable({ expression, range, segmentsX, segmentsY }: Props) {
  const fn = useMemo(() => compileExpression3D(expression), [expression])

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", userSelect: "none" }}>
      <Canvas camera={{ position: [range * 1.6, range * 1.4, range * 1.2], fov: 45 }} onPointerMissed={() => {}}>
        <color attach="background" args={["#e5e5e5"]} />
        <ambientLight intensity={0.6} />
        <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#888888" />
    <directionalLight position={[5, -5, 10]} intensity={1.2} castShadow />
    <directionalLight position={[-5, 5, 8]} intensity={0.5} />
    <Grid args={[range * 2, range * 2]} cellColor="#666666" sectionColor="#333333" />
    <AnimatedSurface fn={fn} range={range} segmentsX={segmentsX} segmentsY={segmentsY} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}
