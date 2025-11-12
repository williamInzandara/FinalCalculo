"use client"

import { useState, useMemo } from "react"
import { Activity, Box, Orbit, TrendingUp, Zap, Settings2, Sparkles } from "lucide-react"
import SurfaceInspector from "@/components/surface/SurfaceInspector"
import SurfaceDraggable from "@/components/surface/SurfaceDraggable"
import GradientField3D from "@/components/surface/GradientField3D"
import SurfaceIntersection from "@/components/surface/SurfaceIntersection"
import DomainRangeCalculator from "@/components/calculators/DomainRangeCalculator"
import LimitsCalculator from "@/components/calculators/LimitsCalculator"
import PartialDerivativesCalculator from "@/components/calculators/PartialDerivativesCalculator"
import LagrangeOptimizer from "@/components/calculators/LagrangeOptimizer"
import IntegrationCalculator from "@/components/calculators/IntegrationCalculator"
import RegionVisualization2D from "@/components/calculators/RegionVisualization2D"
import { compileExpression3D, type FnXYT } from "@/lib/math-expression"

type Viewer = "inspector" | "draggable" | "gradient" | "intersection"

const PRESETS = [
  {
    name: "Onda Ondulante",
    expr: "sin(sqrt(x*x + y*y) - t*3) / (1 + sqrt(x*x + y*y)/4)",
    icon: "🌊",
  },
  {
    name: "Paraboloide Hiperbólico",
    expr: "x*x - y*y",
    icon: "🥨",
  },
  {
    name: "Corte de Toro",
    expr: "sin(sqrt((sqrt(x*x + y*y) - 2)**2))*cos(t)",
    icon: "🍩",
  },
  {
    name: "Pico Gaussiano",
    expr: "3*exp(-(x*x + y*y)/4)*cos(t*2)",
    icon: "⛰️",
  },
  {
    name: "Superficie Retorcida",
    expr: "sin(x)*cos(y) + 0.3*sin(t*2)",
    icon: "🌀",
  },
  {
    name: "Sombrero Mexicano",
    expr: "sin(sqrt(x*x + y*y))/sqrt(x*x + y*y + 0.1)",
    icon: "🎩",
  },
  {
    name: "Silla de Mono",
    expr: "x*x*x - 3*x*y*y",
    icon: "🐵",
  },
  {
    name: "Cartón de Huevos",
    expr: "sin(x)*sin(y)",
    icon: "🥚",
  },
]

export default function Page() {
  const [expr, setExpr] = useState<string>("sin(sqrt(x*x + y*y) - t*3) / (1 + sqrt(x*x + y*y)/4)")
  const [range, setRange] = useState<number>(4)
  const [resolutionSlider, setResolutionSlider] = useState<number>(50)
  const [density, setDensity] = useState<string>("1")
  const [constraint, setConstraint] = useState<string>("")
  const [viewer, setViewer] = useState<Viewer>("draggable")
  const [vectors, setVectors] = useState<number>(18)
  const [vectorScale, setVectorScale] = useState<number>(0.55)
  const [step, setStep] = useState<number>(1e-3)
  const [tParam, setTParam] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const compiledFn = useMemo(() => compileExpression3D(expr), [expr])
  const meshSegments = useMemo(() => 80 + Math.round(resolutionSlider * 1.2), [resolutionSlider])

  const loadPreset = (presetExpr: string) => {
    setExpr(presetExpr)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
  <aside className="w-96 flex flex-col border-r border-border bg-card overflow-hidden shrink-0">
        {/* Header */}
  <div className="grafy-header p-6 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center grafy-glow">
              <Activity className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                graFy<span className="text-primary">Api</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Visualization Modes */}
          <div className="space-y-3">
            <h3 className="grafy-section-title">Modo de Visualización</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setViewer("draggable")}
                className={`grafy-mode-btn p-4 rounded-lg flex flex-col items-start gap-2 ${
                  viewer === "draggable"
                    ? "bg-primary/15 border-2 border-primary text-primary"
                    : "bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Orbit className="w-5 h-5" />
                <div className="text-xs font-semibold">Interactivo</div>
              </button>
              <button
                onClick={() => setViewer("gradient")}
                className={`grafy-mode-btn p-4 rounded-lg flex flex-col items-start gap-2 ${
                  viewer === "gradient"
                    ? "bg-secondary/15 border-2 border-secondary text-secondary"
                    : "bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <div className="text-xs font-semibold">Gradiente</div>
              </button>
              <button
                onClick={() => setViewer("inspector")}
                className={`grafy-mode-btn p-4 rounded-lg flex flex-col items-start gap-2 ${
                  viewer === "inspector"
                    ? "bg-accent/15 border-2 border-accent text-accent"
                    : "bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Settings2 className="w-5 h-5" />
                <div className="text-xs font-semibold">Análisis</div>
              </button>
              <button
                onClick={() => setViewer("intersection")}
                className={`grafy-mode-btn p-4 rounded-lg flex flex-col items-start gap-2 ${
                  viewer === "intersection"
                    ? "bg-chart-4/15 border-2 border-chart-4 text-chart-4"
                    : "bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Box className="w-5 h-5" />
                <div className="text-xs font-semibold">Intersección</div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="grafy-section-title">Superficies Predefinidas</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset.expr)}
                  className="grafy-preset-btn p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted hover:border-primary/50 text-left transition-all duration-200"
                >
                  <div className="text-lg mb-1">{preset.icon}</div>
                  <div className="text-xs font-semibold text-foreground/90">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Function Input */}
          <div className="space-y-3">
            <h3 className="grafy-section-title">Definición de Función</h3>
            <div className="space-y-2">
              <label htmlFor="function" className="text-sm font-semibold text-foreground/90">
                z = f(x, y, t)
              </label>
              <input
                id="function"
                type="text"
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                className="grafy-input w-full px-3 py-2.5 rounded-lg text-sm font-mono focus:outline-none text-foreground"
                placeholder="ej: sin(x+y) - 0.5*cos(t)"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Disponible: <code className="px-1.5 py-0.5 bg-muted/80 rounded text-primary font-mono">x</code>,{" "}
                <code className="px-1.5 py-0.5 bg-muted/80 rounded text-primary font-mono">y</code>,{" "}
                <code className="px-1.5 py-0.5 bg-muted/80 rounded text-primary font-mono">t</code>, sin, cos, tan,
                sqrt, etc.
              </p>
            </div>
          </div>

          {/* Surface Parameters */}
          <div className="space-y-4">
            <h3 className="grafy-section-title">Parámetros de Superficie</h3>

            {/* Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/90">Rango del Dominio</label>
                <span className="grafy-badge">±{range}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={range}
                onChange={(e) => setRange(Number(e.target.value))}
                className="grafy-slider w-full"
              />
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/90">Resolución de malla</label>
                <span className="grafy-badge">{meshSegments}×{meshSegments}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={resolutionSlider}
                onChange={(e) => setResolutionSlider(Number(e.target.value))}
                className="grafy-slider w-full"
              />
            </div>
          </div>

          {/* Gradient Field Controls */}
          {viewer === "gradient" && (
            <div className="space-y-4 grafy-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-bold text-foreground">Opciones de Campo de Gradiente</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground/80">Grilla de Vectores</label>
                  <span className="grafy-badge">
                    {vectors}×{vectors}
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="30"
                  step="2"
                  value={vectors}
                  onChange={(e) => setVectors(Number(e.target.value))}
                  className="grafy-slider w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground/80">Escala de Flecha</label>
                  <span className="grafy-badge">{vectorScale.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={vectorScale}
                  onChange={(e) => setVectorScale(Number(e.target.value))}
                  className="grafy-slider w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground/80">Tamaño de Paso (h)</label>
                  <span className="grafy-badge">{step}</span>
                </div>
                <input
                  type="number"
                  value={step}
                  step="0.0005"
                  min="0.0001"
                  onChange={(e) => setStep(Number(e.target.value))}
                  className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground/80">Parámetro de Tiempo (t)</label>
                  <span className="grafy-badge">{tParam.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.1"
                  value={tParam}
                  onChange={(e) => setTParam(Number(e.target.value))}
                  className="grafy-slider w-full"
                />
              </div>
            </div>
          )}

          {/* Inspector Controls */}
          {viewer === "inspector" && (
            <div className="space-y-4">
              <DomainRangeCalculator expression={expr} range={range} resolution={meshSegments} />
              <LimitsCalculator expression={expr} />
              <PartialDerivativesCalculator expression={expr} />
              <div className="grafy-card p-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground mb-3">Análisis Avanzado</h3>
                <div className="space-y-2">
                  <label htmlFor="density" className="text-sm font-semibold text-foreground/80">
                    Densidad σ(x,y)
                  </label>
                  <input
                    id="density"
                    type="text"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                    placeholder="1 + 0.2*x*x"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="constraint" className="text-sm font-semibold text-foreground/80">
                    Restricción g(x,y) = 0
                  </label>
                  <input
                    id="constraint"
                    type="text"
                    value={constraint}
                    onChange={(e) => setConstraint(e.target.value)}
                    className="grafy-input w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                    placeholder="x*x + y*y - 9"
                  />
                </div>
              </div>
              <LagrangeOptimizer expression={expr} constraint={constraint} />
              <IntegrationCalculator expression={expr} density={density || undefined} />
              <RegionVisualization2D
                expression={expr}
                constraint={constraint}
                xMin={-range}
                xMax={range}
                yMin={-range}
                yMax={range}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 relative bg-background">
        {viewer === "inspector" ? (
          <SurfaceInspector
            expression={expr}
            range={range}
            segmentsX={meshSegments}
            segmentsY={meshSegments}
            densityExpression={density || undefined}
            constraintExpression={constraint || undefined}
          />
        ) : viewer === "draggable" ? (
          <SurfaceDraggable expression={expr} range={range} segmentsX={meshSegments} segmentsY={meshSegments} />
        ) : viewer === "intersection" ? (
          <SurfaceIntersection />
        ) : (
          <GradientField3D
            expression={compiledFn}
            range={range}
            segmentsX={meshSegments}
            segmentsY={meshSegments}
            vectors={vectors}
            vectorScale={vectorScale}
            step={step}
            t={tParam}
          />
        )}
      </main>
    </div>
  )
}
