"use client"

import { useGLTF } from "@react-three/drei"
import { useLayoutEffect, useMemo } from "react"
import * as THREE from "three"

function applyMaterial(scene: THREE.Object3D) {
  scene.traverse((child: any) => {
    if (!child.isMesh) return
    const oldMat = child.material
    child.material = new THREE.MeshStandardMaterial({
      map: oldMat.map || null,
      alphaMap: oldMat.alphaMap || null,
      transparent: !!(oldMat.alphaMap || oldMat.transparent),
      alphaTest: 0.5,
      depthWrite: true,
      color: new THREE.Color("#0d2118"),
      roughness: 1.0,
      metalness: 0.0,
      emissive: new THREE.Color("#0a1f0e"),
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
    })
    child.castShadow = true
    child.receiveShadow = true
  })
}

export default function Tree() {
  const { scene } = useGLTF("/models/assets/tree.glb")

  // Pre-clone ALL instances in useMemo — stable across reloads
  const instances = useMemo(() => {
    const pts = []
    const radius = 1.5
    const count = 17

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi) * 0.5
      const z = radius * Math.sin(phi) * Math.sin(theta)

      if (y < -0.5) continue

      const clone = scene.clone(true)
      applyMaterial(clone)

      pts.push({
        object: clone,
        position: new THREE.Vector3(x, y - 4, z),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2.5, 0),
        scale: 1 + Math.random() * 0.3,
      })
    }

    return pts
  }, [scene])

  return (
    <group>
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