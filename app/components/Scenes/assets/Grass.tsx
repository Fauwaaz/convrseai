"use client"

import { useGLTF } from "@react-three/drei"
import { useLayoutEffect } from "react"
import * as THREE from "three"

export default function Grass() {

  const { scene } = useGLTF("/models/assets/grass.glb")

  useLayoutEffect(() => {

    scene.traverse((child:any) => {

      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: "white",
          roughness: 0.8,
          metalness: 0
        })

      }

    })

  }, [scene])

  return (
    <primitive
      object={scene}
      scale={0.2}
      position={[-0.2,-2,-0.2]}
    />
  )
}