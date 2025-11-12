"use client"

import { useState, useEffect } from "react"
import { Calculator, Info } from "lucide-react"
import { compileExpression3D } from "@/lib/math-expression"

interface DomainRangeCalculatorProps {
  expression: string
  range: number
  resolution: number
}

interface AnalysisResult {
  domain: {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    description: string
  }
  range: {
    zMin: number
    zMax: number
    description: string
  }
  criticalPoints: Array<{ x: number; y: number; z: number; type: string }>
}

export default function DomainRangeCalculator({ expression, range, resolution }: DomainRangeCalculatorProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    calculateDomainRange()
  }, [expression, range, resolution])

  const calculateDomainRange = () => {
    setIsCalculating(true)

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      try {
        const fn = compileExpression3D(expression)
        const t = 0 // Fixed time parameter for analysis

        let zMin = Number.POSITIVE_INFINITY
        let zMax = Number.NEGATIVE_INFINITY
        let validPoints = 0
        let totalPoints = 0

        const step = (2 * range) / resolution

        // Sample the function to find range
        for (let i = 0; i <= resolution; i++) {
          for (let j = 0; j <= resolution; j++) {
            const x = -range + i * step
            const y = -range + j * step
            const z = fn(x, y, t)

            totalPoints++

            if (Number.isFinite(z)) {
              validPoints++
              zMin = Math.min(zMin, z)
              zMax = Math.max(zMax, z)
            }
          }
        }

        // Find critical points (simplified - just sample for local extrema)
        const criticalPoints: Array<{ x: number; y: number; z: number; type: string }> = []
        const criticalStep = (2 * range) / 20 // Coarser grid for critical points

        for (let i = 1; i < 19; i++) {
          for (let j = 1; j < 19; j++) {
            const x = -range + i * criticalStep
            const y = -range + j * criticalStep
            const z = fn(x, y, t)

            if (!Number.isFinite(z)) continue

            // Check if this is a local extremum
            const neighbors = [
              fn(x + criticalStep, y, t),
              fn(x - criticalStep, y, t),
              fn(x, y + criticalStep, t),
              fn(x, y - criticalStep, t),
            ]

            const validNeighbors = neighbors.filter(Number.isFinite)
            if (validNeighbors.length === 4) {
              const isMax = validNeighbors.every((n) => z >= n)
              const isMin = validNeighbors.every((n) => z <= n)

              if (isMax || isMin) {
                criticalPoints.push({
                  x: Number.parseFloat(x.toFixed(3)),
                  y: Number.parseFloat(y.toFixed(3)),
                  z: Number.parseFloat(z.toFixed(3)),
                  type: isMax ? "Maximum" : "Minimum",
                })
              }
            }
          }
        }

        // Sort critical points and limit to top 5
        criticalPoints.sort((a, b) => Math.abs(b.z) - Math.abs(a.z))
        const topCriticalPoints = criticalPoints.slice(0, 5)

        const domainDescription =
          validPoints === totalPoints
            ? `Definido en todas partes en [-${range}, ${range}]²`
            : `Definido en el ${((validPoints / totalPoints) * 100).toFixed(1)}% del dominio`

        const rangeDescription = Number.isFinite(zMin)
          ? `Continuo desde ${zMin.toFixed(3)} hasta ${zMax.toFixed(3)}`
          : "La función no está definida en este dominio"

        setResult({
          domain: {
            xMin: -range,
            xMax: range,
            yMin: -range,
            yMax: range,
            description: domainDescription,
          },
          range: {
            zMin: Number.isFinite(zMin) ? zMin : 0,
            zMax: Number.isFinite(zMax) ? zMax : 0,
            description: rangeDescription,
          },
          criticalPoints: topCriticalPoints,
        })
      } catch (error) {
        console.error("[v0] Error calculating domain/range:", error)
        setResult(null)
      } finally {
        setIsCalculating(false)
      }
    }, 100)
  }

  if (isCalculating) {
    return (
      <div className="grafy-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-sm font-bold text-foreground">Analizando Función...</h3>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="grafy-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Análisis de Dominio y Rango</h3>
        </div>
        <p className="text-sm text-muted-foreground">No se puede analizar la función</p>
      </div>
    )
  }

  return (
    <div className="grafy-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Análisis de Dominio y Rango</h3>
      </div>

      {/* Domain */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <h4 className="text-xs font-bold text-foreground/90">Dominio</h4>
        </div>
        <div className="pl-4 space-y-1">
          <p className="text-xs font-mono text-foreground/80">
            x ∈ [{result.domain.xMin}, {result.domain.xMax}]
          </p>
          <p className="text-xs font-mono text-foreground/80">
            y ∈ [{result.domain.yMin}, {result.domain.yMax}]
          </p>
          <p className="text-xs text-muted-foreground">{result.domain.description}</p>
        </div>
      </div>

      {/* Range */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <h4 className="text-xs font-bold text-foreground/90">Rango</h4>
        </div>
        <div className="pl-4 space-y-1">
          <p className="text-xs font-mono text-foreground/80">
            z ∈ [{result.range.zMin.toFixed(3)}, {result.range.zMax.toFixed(3)}]
          </p>
          <p className="text-xs text-muted-foreground">{result.range.description}</p>
        </div>
      </div>

      {/* Critical Points */}
      {result.criticalPoints.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <h4 className="text-xs font-bold text-foreground/90">Puntos Críticos</h4>
          </div>
          <div className="pl-4 space-y-2">
            {result.criticalPoints.map((pt, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="grafy-badge text-[10px]">{pt.type === "Maximum" ? "Máximo" : "Mínimo"}</span>
                  <span className="font-mono text-foreground/80">
                    ({pt.x}, {pt.y})
                  </span>
                </div>
                <p className="font-mono text-muted-foreground">z = {pt.z}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-foreground/70 leading-relaxed">
          El análisis usa muestreo numérico en el dominio especificado. Los puntos críticos son extremos locales
          aproximados.
        </p>
      </div>
    </div>
  )
}
