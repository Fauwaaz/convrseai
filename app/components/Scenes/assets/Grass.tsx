"use client"

import { useGLTF } from "@react-three/drei"
import { useLayoutEffect } from "react"
import * as THREE from "three"

export default function Grass() {

  const { scene } = useGLTF("/models/assets/grass.glb")

  useLayoutEffect(() => {

    scene.traverse((child: any) => {

      if (!child.isMesh) return

      const oldMat = child.material

      const newMat = new THREE.MeshStandardMaterial({
        map: oldMat.map || null,
        alphaMap: oldMat.alphaMap || null,

        transparent: true,
        alphaTest: 0.5,

        color: new THREE.Color("#1a3a2b"),

        roughness: 0.9,
        metalness: 0
      })

      child.material = newMat
      child.material.side = THREE.DoubleSide

    })

  }, [scene])

  return (
    <primitive
      object={scene}
      scale={1}
      position={[-1.5, -2, -2]}
    />
  )
}