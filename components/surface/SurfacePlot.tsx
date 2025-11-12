"use client"

import { useEffect, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import SurfaceMesh from "../SurfaceMesh"
import { compileExpression3D, type FnXYT } from "@/lib/math-expression"

type Point3 = { x: number; y: number; z: number }
type DataSet = {
  name?: string
  points: Point3[]
  color?: string
  opacity?: number
  size?: number
  type?: "points" | "mesh"
}

type ExpressionProps = {
  expression: string
  range: number
  segmentsX: number
  segmentsY: number
  dataSets?: never
}

type DataSetProps = {
  dataSets: DataSet[]
  range?: number
  expression?: never
  segmentsX?: never
  segmentsY?: never
}

type Props = ExpressionProps | DataSetProps

function buildMeshGeometry(points: Point3[]): THREE.BufferGeometry | null {
  const count = points.length
  if (count < 4) return null

  const k = Math.round(Math.sqrt(count))
  if (k * k !== count) return null

  const nx = k
  const ny = k

  const positions = new Float32Array(count * 3)
  let ptr = 0
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const p = points[j * nx + i]
  positions[ptr++] = p.x
  positions[ptr++] = p.z
  positions[ptr++] = p.y
    }
  }

  const indices = new Uint32Array((nx - 1) * (ny - 1) * 6)
  let ip = 0
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i
      const b = a + 1
      const c = a + nx
      const d = c + 1
      indices[ip++] = a
      indices[ip++] = c
      indices[ip++] = b
      indices[ip++] = b
      indices[ip++] = c
      indices[ip++] = d
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()
  return geometry
}

function buildPointGeometry(points: Point3[]): THREE.BufferGeometry | null {
  const count = points.length
  if (count === 0) return null

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const base = i * 3
    const p = points[i]
  positions[base] = p.x
  positions[base + 1] = p.z
  positions[base + 2] = p.y
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  return geometry
}

function DataSetPrimitive({ dataSet }: { dataSet: DataSet }) {
  const colorHex = dataSet.color ?? "#ff0000"
  const meshGeometry = useMemo(() => buildMeshGeometry(dataSet.points), [dataSet.points])
  const pointGeometry = useMemo(() => buildPointGeometry(dataSet.points), [dataSet.points])

  useEffect(() => () => meshGeometry?.dispose(), [meshGeometry])
  useEffect(() => () => pointGeometry?.dispose(), [pointGeometry])

  if (meshGeometry && dataSet.type !== "points") {
    return (
      <mesh geometry={meshGeometry}>
        <meshStandardMaterial
          color={colorHex}
          transparent={dataSet.opacity !== undefined && dataSet.opacity < 1}
          opacity={dataSet.opacity ?? 1}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    )
  }

  if (!pointGeometry) return null

  return (
    <points geometry={pointGeometry}>
      <pointsMaterial
        color={colorHex}
        size={dataSet.size ?? 1.5}
        transparent={dataSet.opacity !== undefined && dataSet.opacity < 1}
        opacity={dataSet.opacity ?? 1}
      />
    </points>
  )
}

function DataSetRenderer({ dataSets }: { dataSets: DataSet[] }) {
  return (
    <group>
      {dataSets.map((ds, idx) => (
        <DataSetPrimitive key={idx} dataSet={ds} />
      ))}
    </group>
  )
}

function AnimatedExpressionSurface({
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

export default function SurfacePlot(props: Props) {
  const isDataMode = "dataSets" in props
  const range = props.range ?? 4

  const expression = isDataMode ? undefined : props.expression
  const segmentsX = isDataMode ? 80 : props.segmentsX
  const segmentsY = isDataMode ? 80 : props.segmentsY
  const dataSets = isDataMode ? props.dataSets : undefined

  const fn = useMemo(() => {
    if (!expression) return () => 0
    return compileExpression3D(expression)
  }, [expression])

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [range * 1.4, range * 1.1, range * 1.4], fov: 45 }}>
        <color attach="background" args={["#ffffff"]} />
        <hemisphereLight intensity={1.0} color="#ffffff" groundColor="#444444" />
        <directionalLight position={[8, 12, 10]} intensity={0.8} />
        <gridHelper args={[range * 2, 10, 0x222222, 0x888888]} />
        {isDataMode ? (
          dataSets ? <DataSetRenderer dataSets={dataSets} /> : null
        ) : (
          <AnimatedExpressionSurface fn={fn} range={range} segmentsX={segmentsX} segmentsY={segmentsY} />
        )}
      </Canvas>
    </div>
  )
}
