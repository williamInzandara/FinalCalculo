"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { Mesh } from "three"

type Fn = (x: number, y: number) => number;

interface SurfaceMeshProps {
  f: Fn;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  segmentsX: number;
  segmentsY: number;
  color?: string;
}

export default function SurfaceMesh({
  f,
  xMin,
  xMax,
  yMin,
  yMax,
  segmentsX,
  segmentsY,
  color = "#c07a34",
}: SurfaceMeshProps) {
  const meshRef = useRef<Mesh | null>(null)

  const geometry = useMemo(() => {
    const nx = Math.max(2, Math.floor(segmentsX))
    const ny = Math.max(2, Math.floor(segmentsY))

    const geo = new THREE.BufferGeometry()
    const vertexCount = nx * ny
    const verts = new Float32Array(vertexCount * 3)
    const indices = new Uint32Array((nx - 1) * (ny - 1) * 6)

    const dx = (xMax - xMin) / (nx - 1)
    const dy = (yMax - yMin) / (ny - 1)

    let p = 0
    for (let j = 0; j < ny; j++) {
      const y = yMin + j * dy
      for (let i = 0; i < nx; i++) {
        const x = xMin + i * dx
  const rawZ = f(x, y)
  const height = Number.isFinite(rawZ) ? rawZ : 0
  verts[p++] = x
  verts[p++] = height
  verts[p++] = y
      }
    }

    let indexPointer = 0
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i
        const b = a + 1
        const c = a + nx
        const d = c + 1
        indices[indexPointer++] = a
        indices[indexPointer++] = c
        indices[indexPointer++] = b
        indices[indexPointer++] = b
        indices[indexPointer++] = c
        indices[indexPointer++] = d
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))
    geo.computeVertexNormals()
    return geo
  }, [f, xMin, xMax, yMin, yMax, segmentsX, segmentsY])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    if (!meshRef.current) return
    const bufferGeometry = meshRef.current.geometry as THREE.BufferGeometry
    const positionAttr = bufferGeometry.getAttribute("position") as THREE.BufferAttribute
    positionAttr.needsUpdate = true
    bufferGeometry.computeVertexNormals()
  }, [geometry])

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color={color} flatShading={false} side={THREE.DoubleSide} />
    </mesh>
  )
}
