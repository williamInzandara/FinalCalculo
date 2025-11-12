"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import SurfaceMesh from "../SurfaceMesh"
import { compileExpression3D, compileExpression2D, type FnXYT, type FnXY } from "@/lib/math-expression"

type Props = {
  expression: string
  range: number
  segmentsX: number
  segmentsY: number
  densityExpression?: string
  constraintExpression?: string
  domainExpression?: string
}

export default function SurfaceInspector({
  expression,
  range,
  segmentsX,
  segmentsY,
  densityExpression,
  constraintExpression,
  domainExpression,
}: Props) {
  const fn = useMemo(() => compileExpression3D(expression), [expression])
  const dens = useMemo(
    () => compileExpression2D(densityExpression) ?? ((_x: number, _y: number) => 1),
    [densityExpression],
  )
  const domFun = useMemo(() => compileExpression2D(domainExpression), [domainExpression])
  const surfaceFn = useMemo(() => {
    return (x: number, y: number) => {
      const value = fn(x, y, 0)
      return Number.isFinite(value) ? value : 0
    }
  }, [fn])

  const [hover, setHover] = useState<{ x: number; y: number; z: number } | null>(null)
  const [globalStats, setGlobalStats] = useState<{
    zMin: number
    zMax: number
    volume: number
    mass: number
    com: { x: number; y: number; z: number }
  } | null>(null)

  // Calculate global stats
  useMemo(() => {
  const gridDensity = Math.max(segmentsX, segmentsY)
  const N = Math.max(16, Math.min(200, Math.round(gridDensity)))
    let zMin = Number.POSITIVE_INFINITY,
      zMax = Number.NEGATIVE_INFINITY
    let vol = 0
    let mass = 0
    let mx = 0,
      my = 0,
      mz = 0

    const dx = (2 * range) / N
    const dy = (2 * range) / N
    const dA = dx * dy

    for (let j = 0; j < N; j++) {
      const y = -range + (j + 0.5) * dy
      for (let i = 0; i < N; i++) {
        const x = -range + (i + 0.5) * dx

        if (domFun && !(domFun(x, y) <= 0)) continue

        const z = fn(x, y, 0)
        if (Number.isFinite(z)) {
          zMin = Math.min(zMin, z)
          zMax = Math.max(zMax, z)
          const h = Math.max(0, z)
          const sigma = dens(x, y)
          const dV = h * dA
          const dM = sigma * dV

          vol += dV
          mass += dM
          mx += x * dM
          my += y * dM
          mz += h * h * 0.5 * sigma * dA
        }
      }
    }

    const com =
      mass > 0 ? { x: mx / mass, y: my / mass, z: mz / mass } : { x: Number.NaN, y: Number.NaN, z: Number.NaN }
    if (!Number.isFinite(zMin)) zMin = Number.NaN
    if (!Number.isFinite(zMax)) zMax = Number.NaN

    setGlobalStats({ zMin, zMax, volume: vol, mass, com })
  }, [fn, dens, range, segmentsX, segmentsY, domFun])

  const domStr = `[-${range}, ${range}] × [-${range}, ${range}]`
  const rngStr =
    globalStats && Number.isFinite(globalStats.zMin) && Number.isFinite(globalStats.zMax)
      ? `[${globalStats.zMin.toFixed(4)}, ${globalStats.zMax.toFixed(4)}]`
      : "N/D"

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas camera={{ position: [range * 1.6, range * 1.6, range * 1.2], fov: 45 }}>
        <color attach="background" args={["#e5e5e5"]} />
        <ambientLight intensity={0.6} />
        <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#888888" />
        <directionalLight position={[5, -5, 10]} intensity={1.2} />
        <directionalLight position={[-5, 5, 8]} intensity={0.5} />
        <Grid args={[range * 2, range * 2]} cellColor="#666666" sectionColor="#333333" />
        <SurfaceMesh
          f={surfaceFn}
          xMin={-range}
          xMax={range}
          yMin={-range}
          yMax={range}
          segmentsX={segmentsX}
          segmentsY={segmentsY}
        />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>

      {globalStats && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "10px 12px",
            background: "rgba(22, 22, 26, 0.95)",
            border: "1px solid rgba(124, 255, 178, 0.3)",
            borderRadius: 8,
            fontFamily: "Arial, sans-serif",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            maxWidth: 440,
            color: "#f5f5f5",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: "#7cffb2" }}>Inspector</div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ padding: "2px 4px" }}>Dominio (caja)</td>
                <td style={{ padding: "2px 4px" }}>{domStr}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 4px" }}>Rango estimado z</td>
                <td style={{ padding: "2px 4px" }}>{rngStr}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 4px" }}>Volumen (z⁺)</td>
                <td style={{ padding: "2px 4px" }}>{globalStats.volume.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 4px" }}>Masa σ(x,y)</td>
                <td style={{ padding: "2px 4px" }}>{globalStats.mass.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 4px" }}>Centro de masa</td>
                <td style={{ padding: "2px 4px" }}>
                  ({Number.isFinite(globalStats.com.x) ? globalStats.com.x.toFixed(4) : "N/D"},{" "}
                  {Number.isFinite(globalStats.com.y) ? globalStats.com.y.toFixed(4) : "N/D"},{" "}
                  {Number.isFinite(globalStats.com.z) ? globalStats.com.z.toFixed(4) : "N/D"})
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
