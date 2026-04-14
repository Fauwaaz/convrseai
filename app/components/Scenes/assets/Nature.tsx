"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

// ─── Tree ───────────────────────────────────────────────────────────────────

function applyTreeMaterial(scene: THREE.Object3D) {
  scene.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#a8d5a2"),
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.85,       // ← glass-like see-through
      thickness: 1.2,
      transparent: true,
      opacity: 0.3,
      ior: 1.4,                 // ← refraction index
      reflectivity: 0.6,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide,
      depthWrite: false,        // ← needed for proper transparency layering
    })
    child.castShadow = false
  })
}

function Tree() {
  const { scene } = useGLTF("/models/assets/tree.glb")
  const groupRef = useRef<THREE.Group>(null!)

  const instances = useMemo(() => {
    const pts: { object: THREE.Object3D; position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = []
    const radius = 2
    const count = 1

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi) * 0.5
      const z = radius * Math.sin(phi) * Math.sin(theta)

      if (y < -0.5) continue

      const clone = scene.clone(true)
      applyTreeMaterial(clone)

      pts.push({
        object: clone,
        position: new THREE.Vector3(x, y - 9, z),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2.5, 0),
        scale: 0.6 + Math.random() * 0.15,
      })
    }
    return pts
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    const targetY = scroll * 6
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.5
    )
  })

  return (
    <group ref={groupRef}>
      {instances.map((inst, i) => (
        <primitive
          key={i}
          object={inst.object}
          position={inst.position}
          rotation={inst.rotation}
          scale={inst.scale}
        />
      ))}
    </group>
  )
}

// ─── Grass ──────────────────────────────────────────────────────────────────

function Grass() {
  const { scene } = useGLTF("/models/assets/grass.glb")
  const groupRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      if (!child.isMesh) return
      const oldMat = child.material
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#aaccff"),
        roughness: 0.05,
        metalness: 0.0,
        transmission: 0.85,
        thickness: 1.0,
        transparent: true,
        opacity: 0.3,
        ior: 1.3,
        reflectivity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    // grass rises slower than trees — parallax depth feel
    const targetY = scroll * 3
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.5
    )
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={0.6}
        position={[2, -4, -2]}
      />
    </group>
  )
}

// ─── Combined export ─────────────────────────────────────────────────────────

export default function Nature() {
  return (
    <>
      <Tree />
      <Grass />
    </>
  )
}