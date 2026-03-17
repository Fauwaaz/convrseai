"use client"

import { motion } from "framer-motion"
import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useEffect, useRef } from "react"
import * as THREE from "three"

function ScrollController({ children }) {
  const group = useRef()

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

  const group = useRef<THREE.Group>(null!);
  const targetRotation = useRef(0);
  const introProgress = useRef(0);
  const introDone = useRef(false);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // FORCE visible material
        child.material = new THREE.MeshStandardMaterial({
          color: "white",
          metalness: 1,
          roughness: 0.2,
        })
      }
    })

    // CENTER MODEL
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    scene.position.sub(center)

    // AUTO SCALE
    const size = box.getSize(new THREE.Vector3()).length()
    const scale = 2.1 / size
    scene.scale.setScalar(scale)

  }, [scene])

  useFrame((_, delta) => {
    if (!group.current) return;
    if (!introDone.current) {
      introProgress.current += delta * 0.4;

      const t = Math.min(introProgress.current, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      group.current.rotation.y = THREE.MathUtils.degToRad(160) * (1 - eased);
      group.current.scale.setScalar(100 - (100 - 9.5) * eased);

      if (t >= 1) {
        introDone.current = true;
      }

      return;
    }
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRotation.current,
      0.08
    );
  });


  return <primitive object={scene} />
}

export default function Scene2() {

  return (

    <section
      className="scene2-root"
      style={{ fontFamily: "var(--font-crystal), sans-serif" }}
    >
      <div className="scene2-panel">

        <motion.div
          className="scene2-inner"
        >

          <h1 className="scene2-title">
            CREATIVE <br />
            DIGITAL <br />
            EXPERIENCES
          </h1>

          <div className="scene2-canvas">
            <Canvas camera={{ position: [11, 0, 0], fov: 14 }}>
              <ambientLight intensity={0.8} />

              <directionalLight position={[12, 5, 5]} intensity={50} />
              <directionalLight position={[-5, -25, -5]} intensity={20} />

              <Environment preset="city" />


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