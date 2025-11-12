"use client"

import { useEffect, useRef, useState } from "react"
import { Grid3x3, Maximize2 } from "lucide-react"
import { compileExpression3D } from "@/lib/math-expression"

interface RegionVisualization2DProps {
  expression: string
  constraint?: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export default function RegionVisualization2D({
  expression,
  constraint,
  xMin,
  xMax,
  yMin,
  yMax,
}: RegionVisualization2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showGrid, setShowGrid] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, width, height)

    // Calculate scaling
    const xRange = xMax - xMin
    const yRange = yMax - yMin
    const xScale = width / xRange
    const yScale = height / yRange

    const toCanvasX = (x: number) => ((x - xMin) / xRange) * width
    const toCanvasY = (y: number) => height - ((y - yMin) / yRange) * height

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "#1a1a1a"
      ctx.lineWidth = 1

      // Vertical lines
      const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 10)))
      for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        const cx = toCanvasX(x)
        ctx.beginPath()
        ctx.moveTo(cx, 0)
        ctx.lineTo(cx, height)
        ctx.stroke()
      }

      // Horizontal lines
      const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 10)))
      for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        const cy = toCanvasY(y)
        ctx.beginPath()
        ctx.moveTo(0, cy)
        ctx.lineTo(width, cy)
        ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 2

      // X-axis
      if (yMin <= 0 && yMax >= 0) {
        const y0 = toCanvasY(0)
        ctx.beginPath()
        ctx.moveTo(0, y0)
        ctx.lineTo(width, y0)
        ctx.stroke()
      }

      // Y-axis
      if (xMin <= 0 && xMax >= 0) {
        const x0 = toCanvasX(0)
        ctx.beginPath()
        ctx.moveTo(x0, 0)
        ctx.lineTo(x0, height)
        ctx.stroke()
      }
    }

    // Visualize function values as heatmap
    const fn = compileExpression3D(expression)
    const resolution = 100
    const pixelData = ctx.createImageData(width, height)

    let minVal = Number.POSITIVE_INFINITY
    let maxVal = Number.NEGATIVE_INFINITY

    // First pass: find min/max
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xMin + (i / resolution) * xRange
        const y = yMin + (j / resolution) * yRange
        const z = fn(x, y, 0)
        if (Number.isFinite(z)) {
          minVal = Math.min(minVal, z)
          maxVal = Math.max(maxVal, z)
        }
      }
    }

    // Second pass: draw heatmap
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * xRange
        const y = yMax - (py / height) * yRange
        const z = fn(x, y, 0)

        const idx = (py * width + px) * 4

        if (Number.isFinite(z) && maxVal > minVal) {
          const normalized = (z - minVal) / (maxVal - minVal)

          // Color gradient from dark blue (low) to bright green (high)
          const r = Math.floor(normalized * 100)
          const g = Math.floor(100 + normalized * 155)
          const b = Math.floor((1 - normalized) * 200)

          pixelData.data[idx] = r
          pixelData.data[idx + 1] = g
          pixelData.data[idx + 2] = b
          pixelData.data[idx + 3] = 120 // Semi-transparent
        } else {
          pixelData.data[idx] = 20
          pixelData.data[idx + 1] = 20
          pixelData.data[idx + 2] = 30
          pixelData.data[idx + 3] = 50
        }
      }
    }

    ctx.putImageData(pixelData, 0, 0)

    // Draw constraint curve if provided
    if (constraint && constraint.trim() !== "") {
      const g = compileExpression3D(constraint)
      ctx.strokeStyle = "#f0db4f"
      ctx.lineWidth = 2

      ctx.beginPath()
      let firstPoint = true

      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * xRange

        // Find y where g(x,y) ≈ 0
        for (let py = 0; py < height; py++) {
          const y = yMax - (py / height) * yRange
          const gVal = g(x, y, 0)

          if (Math.abs(gVal) < 0.1) {
            if (firstPoint) {
              ctx.moveTo(px, py)
              firstPoint = false
            } else {
              ctx.lineTo(px, py)
            }
          }
        }
      }

      ctx.stroke()
    }

    // Draw labels
    ctx.fillStyle = "#888"
    ctx.font = "10px monospace"
    ctx.fillText(`x: [${xMin.toFixed(1)}, ${xMax.toFixed(1)}]`, 10, height - 10)
    ctx.fillText(`y: [${yMin.toFixed(1)}, ${yMax.toFixed(1)}]`, 10, 20)

    if (Number.isFinite(minVal) && Number.isFinite(maxVal)) {
      ctx.fillText(`z: [${minVal.toFixed(2)}, ${maxVal.toFixed(2)}]`, width - 150, height - 10)
    }
  }, [expression, constraint, xMin, xMax, yMin, yMax, showGrid])

  return (
    <div className="grafy-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-secondary" />
          <h3 className="text-sm font-bold text-foreground">Vista 2D de Región</h3>
        </div>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-colors ${
            showGrid ? "bg-secondary/20 text-secondary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full aspect-square bg-background rounded-lg overflow-hidden border border-border">
        <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Mapa de calor: valores de la función</span>
        {constraint && <span className="text-[#f0db4f]">Amarillo: curva de restricción</span>}
      </div>
    </div>
  )
}
