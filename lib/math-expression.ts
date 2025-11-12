export type FnXYT = (x: number, y: number, t: number) => number
export type FnXY = (x: number, y: number) => number

const FUNCTION_MAP: Record<string, string> = {
  sin: "Math.sin",
  cos: "Math.cos",
  tan: "Math.tan",
  asin: "Math.asin",
  acos: "Math.acos",
  atan: "Math.atan",
  atan2: "Math.atan2",
  sqrt: "Math.sqrt",
  abs: "Math.abs",
  pow: "Math.pow",
  exp: "Math.exp",
  log: "Math.log",
  ln: "Math.log",
  min: "Math.min",
  max: "Math.max",
  floor: "Math.floor",
  ceil: "Math.ceil",
  round: "Math.round",
  trunc: "Math.trunc",
  sinh: "Math.sinh",
  cosh: "Math.cosh",
  tanh: "Math.tanh",
  hypot: "Math.hypot",
  sign: "Math.sign",
}

const CONSTANT_MAP: Record<string, string> = {
  pi: "Math.PI",
  tau: "(Math.PI * 2)",
  e: "Math.E",
}

const MATH_PREFIX = "Math."

function replaceIdentifiers(source: string, regex: RegExp, map: Record<string, string>): string {
  return source.replace(regex, (match, ...rest) => {
    const offset = rest[rest.length - 2] as number
    const full = rest[rest.length - 1] as string
    if (offset >= MATH_PREFIX.length && full.slice(offset - MATH_PREFIX.length, offset).toLowerCase() === MATH_PREFIX.toLowerCase()) {
      return match
    }
    const key = match.toLowerCase()
    return map[key] ?? match
  })
}

function sanitize(expr: string): string {
  if (!expr.trim()) return "0"

  let safe = expr.replace(/\^/g, "**")
  safe = replaceIdentifiers(safe, /\b(pi|tau|e)\b/gi, CONSTANT_MAP)
  safe = replaceIdentifiers(
    safe,
    /\b(sin|cos|tan|asin|acos|atan2|atan|sqrt|abs|pow|exp|log|ln|min|max|floor|ceil|round|trunc|sinh|cosh|tanh|hypot|sign)\b/gi,
    FUNCTION_MAP,
  )

  return safe
}

function wrap3D(fn: FnXYT): FnXYT {
  return (x: number, y: number, t: number) => {
    try {
      const value = fn(x, y, t)
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : Number.NaN
    } catch {
      return Number.NaN
    }
  }
}

function wrap2D(fn: FnXY): FnXY {
  return (x: number, y: number) => {
    try {
      const value = fn(x, y)
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : Number.NaN
    } catch {
      return Number.NaN
    }
  }
}

export function compileExpression3D(expr: string): FnXYT {
  const safe = sanitize(expr)
  try {
    const compiled = new Function("x", "y", "t", `"use strict"; return (${safe});`) as FnXYT
    return wrap3D(compiled)
  } catch {
    return () => Number.NaN
  }
}

export function compileExpression2D(expr: string | undefined): FnXY | null {
  if (!expr) return null
  const safe = sanitize(expr)
  try {
    const compiled = new Function("x", "y", `"use strict"; return (${safe});`) as FnXY
    return wrap2D(compiled)
  } catch {
    return null
  }
}
