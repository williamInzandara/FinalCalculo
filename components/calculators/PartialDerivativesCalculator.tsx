"use client"

import { useState } from "react"
import { Sigma, ArrowRight } from "lucide-react"
import { compileExpression3D } from "@/lib/math-expression"

interface PartialDerivativesCalculatorProps {
  expression: string
}

interface DerivativeResult {
  point: { x: number; y: number }
  fx: number
  fy: number
  fxx: number
  fyy: number
  fxy: number
  gradientMagnitude: number
  gradientDirection: { x: number; y: number }
}

export default function PartialDerivativesCalculator({ expression }: PartialDerivativesCalculatorProps) {
  const [pointX, setPointX] = useState<string>("1")
  const [pointY, setPointY] = useState<string>("1")
  const [h, setH] = useState<number>(0.001)
  const [result, setResult] = useState<DerivativeResult | null>(null)

  const calculateDerivatives = () => {
    try {
      const fn = compileExpression3D(expression)
      const x = Number.parseFloat(pointX)
      const y = Number.parseFloat(pointY)

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return
      }

      const t = 0 // Fixed time

      // First partial derivatives using central difference
      const fx = (fn(x + h, y, t) - fn(x - h, y, t)) / (2 * h)
      const fy = (fn(x, y + h, t) - fn(x, y - h, t)) / (2 * h)

      // Second partial derivatives
      const fxx = (fn(x + h, y, t) - 2 * fn(x, y, t) + fn(x - h, y, t)) / (h * h)
      const fyy = (fn(x, y + h, t) - 2 * fn(x, y, t) + fn(x, y - h, t)) / (h * h)

      // Mixed partial derivative
      const fxy = (fn(x + h, y + h, t) - fn(x + h, y - h, t) - fn(x - h, y + h, t) + fn(x - h, y - h, t)) / (4 * h * h)

      // Gradient magnitude and direction
      const gradientMagnitude = Math.sqrt(fx * fx + fy * fy)
      const gradientDirection = {
        x: gradientMagnitude > 0 ? fx / gradientMagnitude : 0,
        y: gradientMagnitude > 0 ? fy / gradientMagnitude : 0,
      }

      setResult({
        point: { x, y },
        fx: Number.parseFloat(fx.toFixed(6)),
        fy: Number.parseFloat(fy.toFixed(6)),
        fxx: Number.parseFloat(fxx.toFixed(6)),
        fyy: Number.parseFloat(fyy.toFixed(6)),
        fxy: Number.parseFloat(fxy.toFixed(6)),
        gradientMagnitude: Number.parseFloat(gradientMagnitude.toFixed(6)),
        gradientDirection,
      })
    } catch (error) {
      console.error("[v0] Error calculating derivatives:", error)
      setResult(null)
    }
  }

  return (
    <div className="grafy-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sigma className="w-5 h-5 text-accent" />
        <h3 className="text-sm font-bold text-foreground">Derivadas Parciales</h3>
      </div>

      {/* Input controls */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Calcular derivadas en el punto (x, y)</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">x</label>
            <input
              type="number"
              value={pointX}
              onChange={(e) => setPointX(e.target.value)}
              step="0.1"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">y</label>
            <input
              type="number"
              value={pointY}
              onChange={(e) => setPointY(e.target.value)}
              step="0.1"
              className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/80">Tamaño de paso (h)</label>
            <span className="grafy-badge text-[10px]">{h}</span>
          </div>
          <input
            type="range"
            min="0.0001"
            max="0.01"
            step="0.0001"
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            className="grafy-slider w-full"
          />
        </div>

        <button
          onClick={calculateDerivatives}
          className="w-full px-4 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Calcular Derivadas
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="text-xs font-semibold text-foreground/80 mb-2">
            En el punto ({result.point.x}, {result.point.y})
          </div>

          {/* First order derivatives */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground/90">Primer Orden</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">∂f/∂x</div>
                <div className="text-sm font-mono text-foreground font-bold">{result.fx}</div>
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">∂f/∂y</div>
                <div className="text-sm font-mono text-foreground font-bold">{result.fy}</div>
              </div>
            </div>
          </div>

          {/* Second order derivatives */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground/90">Segundo Orden</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">∂²f/∂x²</div>
                <div className="text-xs font-mono text-foreground font-bold">{result.fxx}</div>
              </div>
              <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">∂²f/∂y²</div>
                <div className="text-xs font-mono text-foreground font-bold">{result.fyy}</div>
              </div>
              <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1">∂²f/∂x∂y</div>
                <div className="text-xs font-mono text-foreground font-bold">{result.fxy}</div>
              </div>
            </div>
          </div>

          {/* Gradient */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground/90">Vector Gradiente</h4>
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">∇f</span>
                <span className="text-xs font-mono text-foreground">
                  ({result.fx}, {result.fy})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Magnitud</span>
                <span className="grafy-badge">{result.gradientMagnitude}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Dirección</span>
                <span className="text-xs font-mono text-foreground">
                  ({result.gradientDirection.x.toFixed(3)}, {result.gradientDirection.y.toFixed(3)})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
