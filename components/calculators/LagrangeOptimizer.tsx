"use client"

import { useState } from "react"
import { Target, ArrowRight, AlertCircle } from "lucide-react"
import { compileExpression3D } from "@/lib/math-expression"

interface LagrangeOptimizerProps {
  expression: string
  constraint: string
}

interface OptimizationResult {
  criticalPoints: Array<{
    x: number
    y: number
    z: number
    lambda: number
    type: string
  }>
  converged: boolean
}

export default function LagrangeOptimizer({ expression, constraint }: LagrangeOptimizerProps) {
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const optimize = () => {
    setIsCalculating(true)

    setTimeout(() => {
      try {
        const f = compileExpression3D(expression)
        const g = compileExpression3D(constraint)
        const t = 0
        const h = 0.001

        // Grid search for points where constraint is approximately satisfied
        const candidates: Array<{ x: number; y: number; z: number; lambda: number }> = []
        const searchRange = 5
        const searchStep = 0.3

        for (let i = -searchRange; i <= searchRange; i += searchStep) {
          for (let j = -searchRange; j <= searchRange; j += searchStep) {
            const x = i
            const y = j
            const gVal = g(x, y, t)

            // Check if constraint is approximately satisfied (g(x,y) ≈ 0)
            if (Math.abs(gVal) < 0.1) {
              // Calculate gradients
              const fx = (f(x + h, y, t) - f(x - h, y, t)) / (2 * h)
              const fy = (f(x, y + h, t) - f(x, y - h, t)) / (2 * h)
              const gx = (g(x + h, y, t) - g(x - h, y, t)) / (2 * h)
              const gy = (g(x, y + h, t) - g(x, y - h, t)) / (2 * h)

              // Check if gradients are parallel: ∇f = λ∇g
              // This means fx/gx ≈ fy/gy ≈ λ
              if (Math.abs(gx) > 0.01 && Math.abs(gy) > 0.01) {
                const lambda1 = fx / gx
                const lambda2 = fy / gy

                if (Math.abs(lambda1 - lambda2) < 0.5) {
                  const lambda = (lambda1 + lambda2) / 2
                  const z = f(x, y, t)

                  if (Number.isFinite(z) && Number.isFinite(lambda)) {
                    candidates.push({ x, y, z, lambda })
                  }
                }
              }
            }
          }
        }

        // Remove duplicate points (cluster nearby points)
        const criticalPoints: Array<{ x: number; y: number; z: number; lambda: number; type: string }> = []
        const tolerance = 0.5

        for (const candidate of candidates) {
          let isDuplicate = false
          for (const existing of criticalPoints) {
            const dist = Math.sqrt(Math.pow(candidate.x - existing.x, 2) + Math.pow(candidate.y - existing.y, 2))
            if (dist < tolerance) {
              isDuplicate = true
              break
            }
          }

          if (!isDuplicate) {
            criticalPoints.push({
              ...candidate,
              type: "Critical Point",
            })
          }
        }

        // Sort by function value to identify max and min
        criticalPoints.sort((a, b) => b.z - a.z)

        if (criticalPoints.length > 0) {
          criticalPoints[0].type = "Maximum"
          if (criticalPoints.length > 1) {
            criticalPoints[criticalPoints.length - 1].type = "Minimum"
          }
        }

        // Limit to top 6 points
        const topPoints = criticalPoints.slice(0, 6).map((pt) => ({
          x: Number.parseFloat(pt.x.toFixed(3)),
          y: Number.parseFloat(pt.y.toFixed(3)),
          z: Number.parseFloat(pt.z.toFixed(3)),
          lambda: Number.parseFloat(pt.lambda.toFixed(3)),
          type: pt.type,
        }))

        setResult({
          criticalPoints: topPoints,
          converged: topPoints.length > 0,
        })
      } catch (error) {
        console.error("[v0] Error in Lagrange optimization:", error)
        setResult(null)
      } finally {
        setIsCalculating(false)
      }
    }, 100)
  }

  return (
    <div className="grafy-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-chart-4" />
        <h3 className="text-sm font-bold text-foreground">Multiplicadores de Lagrange</h3>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Optimizar f(x,y) sujeto a la restricción g(x,y) = 0 usando el método de multiplicadores de Lagrange: ∇f = λ∇g
      </p>

      <button
        onClick={optimize}
        disabled={isCalculating || !constraint}
        className="w-full px-4 py-2.5 bg-chart-4 hover:bg-chart-4/90 text-chart-4-foreground rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculating ? "Optimizando..." : "Encontrar Puntos Críticos"}
        <ArrowRight className="w-4 h-4" />
      </button>

      {!constraint && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive leading-relaxed">
            Por favor especifica una restricción g(x,y) = 0 en la sección de Análisis Avanzado arriba
          </p>
        </div>
      )}

      {result && result.converged && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground/90">Puntos Críticos Encontrados</h4>
            <span className="grafy-badge">{result.criticalPoints.length}</span>
          </div>

          <div className="space-y-2">
            {result.criticalPoints.map((pt, idx) => (
              <div key={idx} className="p-3 bg-muted/30 border border-border rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pt.type === "Maximum"
                        ? "bg-primary/20 text-primary"
                        : pt.type === "Minimum"
                          ? "bg-secondary/20 text-secondary"
                          : "bg-muted text-foreground/70"
                    }`}
                  >
                    {pt.type === "Maximum" ? "Máximo" : pt.type === "Minimum" ? "Mínimo" : "Punto Crítico"}
                  </span>
                  <span className="text-xs font-mono text-foreground/80">λ = {pt.lambda}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground">x</div>
                    <div className="font-mono text-foreground">{pt.x}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">y</div>
                    <div className="font-mono text-foreground">{pt.y}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">f(x,y)</div>
                    <div className="font-mono text-foreground">{pt.z}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !result.converged && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive leading-relaxed">
            No se encontraron puntos críticos. Intenta ajustar la función o la restricción.
          </p>
        </div>
      )}
    </div>
  )
}
