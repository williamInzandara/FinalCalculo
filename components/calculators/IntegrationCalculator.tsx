"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Sigma, ArrowRight } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import SurfaceMesh from "@/components/SurfaceMesh"
import { compileExpression3D } from "@/lib/math-expression"

interface IntegrationCalculatorProps {
  expression: string
  density?: string
}

interface IntegrationResult {
  volume: number
  surfaceArea: number
  mass: number
  centerOfMass: { x: number; y: number; z: number }
  momentOfInertia: { Ix: number; Iy: number; Iz: number }
}

type ColumnSample = {
  x: number
  y: number
  height: number
}

function Columns({ samples, dx, dy, color }: { samples: ColumnSample[]; dx: number; dy: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const matrix = new THREE.Matrix4()
    const scale = new THREE.Vector3()
    const position = new THREE.Vector3()
    const rotation = new THREE.Quaternion()

    samples.forEach((sample, index) => {
      const h = Math.max(1e-6, Math.abs(sample.height))
      position.set(sample.x, sample.height >= 0 ? h / 2 : -h / 2, sample.y)
      scale.set(dx * 0.9, h, dy * 0.9)
      matrix.compose(position, rotation, scale)
      mesh.setMatrixAt(index, matrix)
    })

    mesh.count = samples.length
    mesh.instanceMatrix.needsUpdate = true
  }, [samples, dx, dy])

  if (samples.length === 0) return null

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, samples.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  )
}

function IntegrationVisualizer({
  expression,
  xMin,
  xMax,
  yMin,
  yMax,
  resolution,
}: {
  expression: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  resolution: number
}) {
  const fn = useMemo(() => compileExpression3D(expression), [expression])

  const gridSamples = useMemo(() => {
    const nx = Math.max(4, Math.min(30, Math.round(resolution / 2)))
    const ny = Math.max(4, Math.min(30, Math.round(resolution / 2)))
    const dx = (xMax - xMin) / nx
    const dy = (yMax - yMin) / ny

    const positive: ColumnSample[] = []
    const negative: ColumnSample[] = []

    for (let ix = 0; ix < nx; ix++) {
      const x = xMin + (ix + 0.5) * dx
      for (let iy = 0; iy < ny; iy++) {
        const y = yMin + (iy + 0.5) * dy
        const val = fn(x, y, 0)
        if (!Number.isFinite(val)) continue
        if (val >= 0) {
          positive.push({ x, y, height: val })
        } else {
          negative.push({ x, y, height: val })
        }
      }
    }

    return {
      dx,
      dy,
      positive,
      negative,
      segmentsX: Math.min(160, Math.max(40, nx * 2)),
      segmentsY: Math.min(160, Math.max(40, ny * 2)),
    }
  }, [fn, xMin, xMax, yMin, yMax, resolution])

  const baseWidth = xMax - xMin
  const baseDepth = yMax - yMin
  const centerX = (xMin + xMax) / 2
  const centerY = (yMin + yMax) / 2

  const extent = Math.max(baseWidth, baseDepth)

  return (
    <div style={{ width: "100%", height: 320 }}>
      <Canvas camera={{ position: [centerX + extent * 0.9, extent * 0.9, centerY + extent * 0.9], fov: 45 }}>
        <color attach="background" args={["#f6f6f6"]} />
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.9} color="#ffffff" groundColor="#444444" />
        <directionalLight position={[extent, extent * 1.2, extent]} intensity={0.8} />
        <gridHelper args={[Math.max(baseWidth, baseDepth) * 1.4, 12, 0x999999, 0xbbbbbb]} />
        <axesHelper args={[extent * 0.7]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, centerY]}>
          <planeGeometry args={[baseWidth, baseDepth, 1, 1]} />
          <meshStandardMaterial color="#d0d7ff" transparent opacity={0.25} />
        </mesh>
        <SurfaceMesh
          f={(x, y) => fn(x, y, 0)}
          xMin={xMin}
          xMax={xMax}
          yMin={yMin}
          yMax={yMax}
          segmentsX={gridSamples.segmentsX}
          segmentsY={gridSamples.segmentsY}
          color="#c07a34"
        />
        <Columns samples={gridSamples.positive} dx={gridSamples.dx} dy={gridSamples.dy} color="#2563eb" />
        <Columns samples={gridSamples.negative} dx={gridSamples.dx} dy={gridSamples.dy} color="#dc2626" />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} target={[centerX, 0, centerY]} />
      </Canvas>
    </div>
  )
}

export default function IntegrationCalculator({ expression, density }: IntegrationCalculatorProps) {
  const [xMin, setXMin] = useState<string>("-2")
  const [xMax, setXMax] = useState<string>("2")
  const [yMin, setYMin] = useState<string>("-2")
  const [yMax, setYMax] = useState<string>("2")
  const [resolution, setResolution] = useState<number>(50)
  const [result, setResult] = useState<IntegrationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const bounds = useMemo(() => {
    const rawXMin = Number.parseFloat(xMin)
    const rawXMax = Number.parseFloat(xMax)
    const rawYMin = Number.parseFloat(yMin)
    const rawYMax = Number.parseFloat(yMax)

    let safeXMin = Number.isFinite(rawXMin) ? rawXMin : -2
    let safeXMax = Number.isFinite(rawXMax) ? rawXMax : 2
    let safeYMin = Number.isFinite(rawYMin) ? rawYMin : -2
    let safeYMax = Number.isFinite(rawYMax) ? rawYMax : 2

    if (safeXMin === safeXMax) safeXMax = safeXMin + 1
    if (safeYMin === safeYMax) safeYMax = safeYMin + 1
    if (safeXMin > safeXMax) [safeXMin, safeXMax] = [safeXMax, safeXMin]
    if (safeYMin > safeYMax) [safeYMin, safeYMax] = [safeYMax, safeYMin]

    return {
      xMin: safeXMin,
      xMax: safeXMax,
      yMin: safeYMin,
      yMax: safeYMax,
    }
  }, [xMin, xMax, yMin, yMax])

  const calculateIntegrals = () => {
    setIsCalculating(true)

    setTimeout(() => {
      try {
        const f = compileExpression3D(expression)
        const rho = density ? compileExpression3D(density) : () => 1
        const t = 0

        let x0 = Number.parseFloat(xMin)
        let x1 = Number.parseFloat(xMax)
        let y0 = Number.parseFloat(yMin)
        let y1 = Number.parseFloat(yMax)

        if (!Number.isFinite(x0) || !Number.isFinite(x1) || !Number.isFinite(y0) || !Number.isFinite(y1)) {
          setIsCalculating(false)
          return
        }

        if (x0 === x1) x1 = x0 + 1
        if (y0 === y1) y1 = y0 + 1
        if (x0 > x1) [x0, x1] = [x1, x0]
        if (y0 > y1) [y0, y1] = [y1, y0]

        const dx = (x1 - x0) / resolution
        const dy = (y1 - y0) / resolution

        let volume = 0
        let surfaceArea = 0
        let mass = 0
        let momentX = 0
        let momentY = 0
        let momentZ = 0
        let Ix = 0
        let Iy = 0
        let Iz = 0

        // Double integration using Riemann sum
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = x0 + (i + 0.5) * dx
            const y = y0 + (j + 0.5) * dy
            const z = f(x, y, t)

            if (Number.isFinite(z)) {
              const density_val = rho(x, y, t)
              const dA = dx * dy

              // Volume under surface
              if (z > 0) {
                volume += z * dA
              } else {
                volume += Math.abs(z) * dA
              }

              // Surface area element: dS = sqrt(1 + fx^2 + fy^2) dA
              const h = 0.001
              const fx = (f(x + h, y, t) - f(x - h, y, t)) / (2 * h)
              const fy = (f(x, y + h, t) - f(x, y - h, t)) / (2 * h)

              if (Number.isFinite(fx) && Number.isFinite(fy)) {
                const dS = Math.sqrt(1 + fx * fx + fy * fy) * dA
                surfaceArea += dS

                // Mass element: dm = ρ dS
                const dm = density_val * dS
                mass += dm

                // Moments for center of mass
                momentX += x * dm
                momentY += y * dm
                momentZ += z * dm

                // Moments of inertia
                Ix += (y * y + z * z) * dm
                Iy += (x * x + z * z) * dm
                Iz += (x * x + y * y) * dm
              }
            }
          }
        }

        const centerOfMass = {
          x: mass > 0 ? momentX / mass : 0,
          y: mass > 0 ? momentY / mass : 0,
          z: mass > 0 ? momentZ / mass : 0,
        }

        setResult({
          volume: Number.parseFloat(volume.toFixed(6)),
          surfaceArea: Number.parseFloat(surfaceArea.toFixed(6)),
          mass: Number.parseFloat(mass.toFixed(6)),
          centerOfMass: {
            x: Number.parseFloat(centerOfMass.x.toFixed(6)),
            y: Number.parseFloat(centerOfMass.y.toFixed(6)),
            z: Number.parseFloat(centerOfMass.z.toFixed(6)),
          },
          momentOfInertia: {
            Ix: Number.parseFloat(Ix.toFixed(6)),
            Iy: Number.parseFloat(Iy.toFixed(6)),
            Iz: Number.parseFloat(Iz.toFixed(6)),
          },
        })
      } catch (error) {
        console.error("[v0] Error calculating integrals:", error)
        setResult(null)
      } finally {
        setIsCalculating(false)
      }
    }, 100)
  }

  return (
    <div className="grafy-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sigma className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Integración Doble</h3>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Calcular volumen, área de superficie, masa y centro de masa sobre una región rectangular
      </p>

      {/* Integration bounds */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">x min</label>
            <input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(e.target.value)}
              step="0.5"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">x max</label>
            <input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(e.target.value)}
              step="0.5"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">y min</label>
            <input
              type="number"
              value={yMin}
              onChange={(e) => setYMin(e.target.value)}
              step="0.5"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">y max</label>
            <input
              type="number"
              value={yMax}
              onChange={(e) => setYMax(e.target.value)}
              step="0.5"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="2"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/80">Resolución de integración</label>
            <span className="grafy-badge text-[10px]">
              {resolution}×{resolution}
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="10"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            className="grafy-slider w-full"
          />
        </div>

        <button
          onClick={calculateIntegrals}
          disabled={isCalculating}
          className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isCalculating ? "Calculando..." : "Calcular Integrales"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Volume and Surface Area */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground/90">Propiedades Geométricas</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">Volumen</div>
                <div className="text-sm font-mono text-foreground font-bold">{result.volume}</div>
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">Área de Superficie</div>
                <div className="text-sm font-mono text-foreground font-bold">{result.surfaceArea}</div>
              </div>
            </div>
          </div>

          {/* Mass properties */}
          {density && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground/90">Propiedades de Masa</h4>
                <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <div className="text-[10px] text-muted-foreground mb-1">Masa Total</div>
                  <div className="text-sm font-mono text-foreground font-bold">{result.mass}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground/90">Centro de Masa</h4>
                <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground">x̄</div>
                    <div className="font-mono text-foreground">{result.centerOfMass.x}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">ȳ</div>
                    <div className="font-mono text-foreground">{result.centerOfMass.y}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">z̄</div>
                    <div className="font-mono text-foreground">{result.centerOfMass.z}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground/90">Momentos de Inercia</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-chart-4/5 border border-chart-4/20 rounded text-center">
                    <div className="text-[10px] text-muted-foreground">Iₓ</div>
                    <div className="text-xs font-mono text-foreground">{result.momentOfInertia.Ix.toFixed(3)}</div>
                  </div>
                  <div className="p-2 bg-chart-4/5 border border-chart-4/20 rounded text-center">
                    <div className="text-[10px] text-muted-foreground">Iᵧ</div>
                    <div className="text-xs font-mono text-foreground">{result.momentOfInertia.Iy.toFixed(3)}</div>
                  </div>
                  <div className="p-2 bg-chart-4/5 border border-chart-4/20 rounded text-center">
                    <div className="text-[10px] text-muted-foreground">Iᵤ</div>
                    <div className="text-xs font-mono text-foreground">{result.momentOfInertia.Iz.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="text-xs font-bold text-foreground/90">Visualización geométrica ∬ f(x,y) dA</h4>
        <IntegrationVisualizer
          expression={expression}
          xMin={bounds.xMin}
          xMax={bounds.xMax}
          yMin={bounds.yMin}
          yMax={bounds.yMax}
          resolution={resolution}
        />
        <p className="text-[11px] text-muted-foreground">
          Las columnas translúcidas representan un sumatorio de Riemann sobre el dominio. Azul suma aportes positivos, rojo
          los negativos. Gira la vista para inspeccionar el volumen calculado por la integral doble.
        </p>
      </div>
    </div>
  )
}
