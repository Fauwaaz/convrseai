"use client"

import { motion } from "framer-motion"
import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useEffect, useLayoutEffect, useRef } from "react"
import * as THREE from "three"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import Image from "next/image"

let _scroll = 0
let _target = 0

if (typeof window !== "undefined") {
  window.addEventListener(
    "scroll",
    () => {
      _target = window.scrollY / window.innerHeight
    },
    { passive: true }
  )
}


export function getSmoothScroll() {
  _scroll += (_target - _scroll) * 0.08 // 🔥 easing strength
  return _scroll
}

// ✅ Fix 3: type children properly
function ScrollController({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(() => {
    const scroll = window.scrollY / window.innerHeight
    if (group.current) {
      group.current.rotation.y = scroll * Math.PI * 0.5
    }
  })

  return <group ref={group}>{children}</group>
}

function LogoMesh() {
  const { scene } = useGLTF("/models/logo/logo.glb")
  const group = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return

      const mesh = child as THREE.Mesh

      mesh.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#ffffff"),
        metalness: 1.0,
        roughness: 0.2,
        transmission: 0.6,
        thickness: 3.0,
        ior: 2.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
        envMapIntensity: 3.0,
        iridescence: 1.0,
        iridescenceIOR: 2.2,
        iridescenceThicknessRange: [100, 800] as [number, number],
        side: THREE.DoubleSide,
        depthWrite: true,
        depthTest: true,
      })
      mesh.renderOrder = 10
      mesh.castShadow = false
      mesh.receiveShadow = false
    })

    // ✅ CENTER PIVOT
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    scene.position.sub(center)

    // ✅ AUTO SCALE (same as your working version)
    const size = box.getSize(new THREE.Vector3()).length()
    scene.scale.setScalar(2.4 / size)

  }, [scene])

  // useFrame(() => {
  //   if (!group.current) return

  //   const scroll = getSmoothScroll()

  //   // 🔥 define when animation should happen
  //   const start = 0.6   // when section enters
  //   const end = 2.2     // when section exits

  //   // normalize 0 → 1 ONLY inside this range
  //   const raw = (scroll - start) / (end - start)

  //   const progress = THREE.MathUtils.clamp(raw, 0, 1)

  //   // optional easing (makes it feel premium)
  //   const eased = THREE.MathUtils.smoothstep(progress, 0, 1)

  //   // 🔥 Y movement ONLY in this range
  //   const baseY = 0
  //   const moveY = 6

  //   const targetY = baseY + (1 - eased) * moveY

  //   group.current.rotation.x = 0
  //   group.current.rotation.z = 0

  //   group.current.position.y = THREE.MathUtils.lerp(
  //     group.current.position.y,
  //     targetY,
  //     0.15
  //   )
  // })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}


export default function Scene2() {
  return (
    <section
      className="scene2-root relative overflow-hidden"
      style={{ fontFamily: "var(--font-crystal), sans-serif" }}
    >

      {/* <div className="absolute top-46 w-full">
        <Image
          src="/textures/glass-edge-3.svg"
          alt="Line 1"
          width={1920}
          height={1080}
          className="line1 absolute top-0 left-0 w-full h-auto transform -rotate-5"
        />
      </div> */}

      {/* <div className="distortion-layer" /> */}

      <div className="scene2-panel">
        <motion.div className="scene2-inner">
          <h1 className="scene2-title">
            CREATIVE <br />
            DIGITAL <br />
            EXPERIENCES
          </h1>

          <div className="scene2-canvas">
            <Canvas camera={{ position: [0, 0, 8], fov: 32 }}>
              <ambientLight intensity={0.8} />

              <directionalLight position={[12, 5, 5]} intensity={50} />
              <directionalLight position={[-5, -25, -5]} intensity={20} />

              <ScrollController>
                <LogoMesh />
              </ScrollController>

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                makeDefault
              />

              <Environment preset="night" />

              <EffectComposer>
                <Bloom intensity={0.005} luminanceThreshold={0.1} />
              </EffectComposer>
            </Canvas>
          </div>

          <p className="scene2-text">
            Founded in 2012
            <br /><br />
            We blend story, art & technology as an in-house team of passionate makers
            <br /><br />
            Our industry-leading web toolset consistently delivers award-winning work through quality & performance
          </p>
        </motion.div>
      </div>
    </section>
  )
}