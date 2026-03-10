"use client"

import { useGLTF, useEnvironment } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef, useLayoutEffect, useEffect } from "react"
import * as THREE from "three"

export default function Wire() {

  const { scene } = useGLTF("/models/wires.glb")
  const env = useEnvironment({ preset: "city" })
  const targetRotation = useRef(0);


  const ref = useRef<THREE.Group>(null!)
  const progress = useRef(0)



  useLayoutEffect(() => {

    scene.traverse((child: any) => {

      if (child.isMesh) {

        child.geometry.computeVertexNormals()

        child.material = new THREE.MeshPhysicalMaterial({

          color: "#ffffff",

          metalness: 1,
          roughness: 0.12,

          clearcoat: 1,
          clearcoatRoughness: 0,

          envMap: env,
          envMapIntensity: 2,

          reflectivity: 1,

          transmission: 0.15,
          thickness: 0.5,

        })

      }

    })

  }, [scene, env])

  useFrame((state, delta) => {

    if (!ref.current) return

    progress.current += delta * 0.4
    const p = Math.min(progress.current, 1)

    const eased = THREE.MathUtils.smoothstep(p, 0, 1)

    ref.current.position.y = -4.7 + eased * 3

    ref.current.rotation.y = eased * Math.PI * 1.45

  })



  return (
    <primitive
      ref={ref}
      object={scene}
      scale={0.5}
      position={[0.03, -3, 0.08]}
    />
  )
}