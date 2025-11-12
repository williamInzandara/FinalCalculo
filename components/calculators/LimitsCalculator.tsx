"use client"

import { useState } from "react"
import { TrendingUp, ArrowRight } from "lucide-react"
import { compileExpression3D } from "@/lib/math-expression"

interface LimitsCalculatorProps {
  expression: string
}

interface LimitResult {
  point: { x: number; y: number }
  limit: number | string
  paths: Array<{ name: string; value: number | string }>
  exists: boolean
}

export default function LimitsCalculator({ expression }: LimitsCalculatorProps) {
  const [targetX, setTargetX] = useState<string>("0")
  const [targetY, setTargetY] = useState<string>("0")
  const [result, setResult] = useState<LimitResult | null>(null)

  const calculateLimit = () => {
    try {
      const fn = compileExpression3D(expression)
      const x0 = Number.parseFloat(targetX)
      const y0 = Number.parseFloat(targetY)

      if (!Number.isFinite(x0) || !Number.isFinite(y0)) {
        return
      }

      // Test limit along different paths
      const epsilon = 0.001
      const paths: Array<{ name: string; value: number | string }> = []

      // Path 1: Along x-axis (y = y0)
      const path1 = fn(x0 + epsilon, y0, 0)
      paths.push({
        name: "Por eje x",
        value: Number.isFinite(path1) ? Number.parseFloat(path1.toFixed(6)) : "indefinido",
      })

      // Path 2: Along y-axis (x = x0)
      const path2 = fn(x0, y0 + epsilon, 0)
      paths.push({
        name: "Por eje y",
        value: Number.isFinite(path2) ? Number.parseFloat(path2.toFixed(6)) : "indefinido",
      })

      // Path 3: Along y = x diagonal
      const path3 = fn(x0 + epsilon, y0 + epsilon, 0)
      paths.push({
        name: "Por diagonal y=x",
        value: Number.isFinite(path3) ? Number.parseFloat(path3.toFixed(6)) : "indefinido",
      })

      // Path 4: Along y = -x diagonal
      const path4 = fn(x0 + epsilon, y0 - epsilon, 0)
      paths.push({
        name: "Por diagonal y=-x",
        value: Number.isFinite(path4) ? Number.parseFloat(path4.toFixed(6)) : "indefinido",
      })

      // Path 5: Parabolic path y = x²
      const path5 = fn(x0 + epsilon, y0 + epsilon * epsilon, 0)
      paths.push({
        name: "Por parábola y=x²",
        value: Number.isFinite(path5) ? Number.parseFloat(path5.toFixed(6)) : "indefinido",
      })

      // Check if all finite paths agree
      const finiteValues = paths.map((p) => p.value).filter((v) => typeof v === "number") as number[]

      let limitValue: number | string = "No existe"
      let exists = false

      if (finiteValues.length > 0) {
        const first = finiteValues[0]
        const tolerance = 0.01
        const allAgree = finiteValues.every((v) => Math.abs(v - first) < tolerance)

        if (allAgree) {
          limitValue = Number.parseFloat(first.toFixed(6))
          exists = true
        } else {
          limitValue = "Dependiente del camino"
        }
      }

      setResult({
        point: { x: x0, y: y0 },
        limit: limitValue,
        paths,
        exists,
      })
    } catch (error) {
      console.error("[v0] Error calculando límite:", error)
      setResult(null)
    }
  }

  return (
    <div className="grafy-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-secondary" />
        <h3 className="text-sm font-bold text-foreground">Calculadora de Límites</h3>
      </div>

      {/* Input point */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Calcular límite cuando (x,y) → (x₀,y₀)</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">x₀</label>
            <input
              type="number"
              value={targetX}
              onChange={(e) => setTargetX(e.target.value)}
              step="0.1"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">y₀</label>
            <input
              type="number"
              value={targetY}
              onChange={(e) => setTargetY(e.target.value)}
              step="0.1"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <button
          onClick={calculateLimit}
          className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Calcular Límite
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/80">
              lim
              <sub className="text-[10px]">
                (x,y)→({result.point.x},{result.point.y})
              </sub>{" "}
              f(x,y)
            </span>
            <span
              className={`grafy-badge ${result.exists ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}
            >
              {result.exists ? "Existe" : "No existe"}
            </span>
          </div>

          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-sm font-bold text-foreground">
              {typeof result.limit === "number" ? (
                <span className="font-mono">= {result.limit}</span>
              ) : (
                <span className="text-destructive">{result.limit}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground/90">Análisis por Trayectorias</h4>
            <div className="space-y-1.5">
              {result.paths.map((path, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                  <span className="text-muted-foreground">
                    {path.name.includes("x-axis")
                      ? "Por eje x"
                      : path.name.includes("y-axis")
                        ? "Por eje y"
                        : path.name.includes("y=x diagonal")
                          ? "Por diagonal y=x"
                          : path.name.includes("y=-x diagonal")
                            ? "Por diagonal y=-x"
                            : path.name.includes("parabola")
                              ? "Por parábola y=x²"
                              : path.name}
                  </span>
                  <span className="font-mono text-foreground/90">
                    {typeof path.value === "number"
                      ? path.value
                      : path.value === "undefined"
                        ? "indefinido"
                        : path.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
