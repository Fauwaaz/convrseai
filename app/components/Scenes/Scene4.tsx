"use client"

import { OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

// ─── Tune these ───────────────────────────────────────────────────────────────
const MODEL_SCALE    = 1.0
const MODEL_POSITION = [0.2, 0, 0] as const
const MODEL_ROTATION = [0.05, 0.2, -0.01] as const
const CAMERA_POS     = [10, -2, 22] as const   // front-facing, slightly above
const CAMERA_FOV     = 42                      // wider — fills frame like ref                // field of view

function Scene4Model({ sectionRef }: { sectionRef: React.RefObject<HTMLElement> }) {
  const { scene } = useGLTF("/models/assets/scene4.glb")
  const groupRef  = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    // Center pivot only — position/scale controlled via primitive props below
    const box    = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    scene.position.sub(center)
  }, [scene])

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={MODEL_SCALE}
        position={MODEL_POSITION}
        rotation={MODEL_ROTATION}
      />
    </group>
  )
}

function Scene4Lights() {
  return (
    <>
      {/* Near-black ambient — almost nothing */}
      <ambientLight intensity={0.02} color="#030810" />

      {/* Cyan screen glow — primary source, tight */}
      <pointLight position={[0, 2, 0.5]}  intensity={3}   color="#00c8ff" distance={8}  decay={2.5} />

      {/* Water pool below — teal bounce */}
      <pointLight position={[0, -2, 0.5]} intensity={2}   color="#009988" distance={6}  decay={2}   />

      {/* Atmosphere left/right — very dim, just enough for fog */}
      <pointLight position={[-5, 0, -2]}  intensity={0.6} color="#0a1a2a" distance={12} decay={2}   />
      <pointLight position={[ 5, 0, -2]}  intensity={0.6} color="#0a1a2a" distance={12} decay={2}   />

      {/* Cold rim from behind — separates pillars from bg */}
      <directionalLight position={[0, 3, -6]} intensity={0.3} color="#2255aa" />
    </>
  )
}

export default function Scene4() {
  const sectionRef = useRef<HTMLElement>(null!)

  return (
    <section
      ref={sectionRef}
      style={{
        position:        "relative",
        width:           "100%",
        height:          "100vh",
        overflow:        "hidden",
        backgroundColor: "#000000",
      }}
    >
      <Canvas
        camera={{ position: CAMERA_POS, fov: CAMERA_FOV }}
        gl={{ alpha: false, antialias: false, powerPreference: "high-performance" }}
        shadows
        style={{ background: "#020810" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x020810, 1)
          gl.shadowMap.enabled = true
          gl.shadowMap.type    = THREE.PCFSoftShadowMap
        }}
      >
        <Scene4Lights />
        <fogExp2 attach="fog" args={["#020810", 0.12]} />
        <Scene4Model sectionRef={sectionRef} />
        <EffectComposer>
          {/* Low bloom — only emissive panels glow, not the whole scene */}
          <Bloom intensity={0.0000001} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </section>
  )
}