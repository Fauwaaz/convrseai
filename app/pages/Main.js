"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useVideoTexture } from "@react-three/drei";
import Model from "../components/Model";
// import { MouseOverlay } from "../components/Effects";
// import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Wire from "../components/Wire";
import { useRef } from "react";
import * as THREE from "three";


function LogoGroup({ children }) {

  const ref = useRef()

  useFrame((state) => {
    const scroll = window.scrollY / window.innerHeight

    ref.current.rotation.y = scroll * Math.PI * 0.5
  })

  return <group ref={ref}>{children}</group>
}

function VideoEnv() {

  const texture = useVideoTexture("/video/reel.mp4")

  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <Environment
      map={texture}
      background={false}
      blur={2}
    />
  )
}

export default function Main() {
  return (
    <>
      {/* 3D Model Layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          pointerEvents: "auto"
        }}
        className="glow-bg"
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ alpha: true }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >

          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={2} />

          <LogoGroup>

            <Wire />

            <Model rotation={[0, Math.PI, 0]} scale={9.5} />

          </LogoGroup>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            makeDefault
          />

          <VideoEnv />
        </Canvas>
      </div>

      {/* <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none"
        }}
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10], zoom: 100 }}
          gl={{ alpha: true, toneMapped: false }}
        >

          <EffectComposer>
            <Bloom intensity={1} luminanceThreshold={0} />
          </EffectComposer>
          <MouseOverlay />
        </Canvas>
      </div> */}

      <div style={{ height: "200vh" }} />
      <div className="flex min-h-screen items-center justify-center z-5 relative">
        <div className="flex justify-center items-end gap-7 max-w-5xl">
          <h1 className="text-white text-8xl font-crystal-regular">CREATIVE DIGITAL EXPERIENCES</h1>
          <p className="text-sm text-gray-200 mt-5 uppercase font-crystal-regular">Founded in 2012
            <br />
            <br />
            We blend story, art & technology as an in-house team of passionate makers
            <br />
            <br />
            Our industry-leading web toolset consistently delivers award-winning work through quality & performance</p>
        </div>
      </div>
    </>
  );
}