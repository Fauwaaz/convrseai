"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useVideoTexture } from "@react-three/drei";
import Model from "../components/Model";
// import { MouseOverlay } from "../components/Effects";
// import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Wire from "../components/Wire";
import { useRef } from "react";
import * as THREE from "three";


import Scene1 from "../components/Scenes/Scene1";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Scene2 from "../components/Scenes/Scene2";
import Nature from "../components/Scenes/assets/Nature";
import Scene3 from "../components/Scenes/Scene3";

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


export default function Main() {
  return (
    <>

      <div className="projector-layer">
        <video autoPlay loop muted playsInline>
          <source src="/video/reel.mp4" type="video/mp4" />
        </video>
      </div>
      {/* 3D Model Layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 15,
          pointerEvents: "auto"
        }}
        className="glow-bg"
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ alpha: true }}
          shadows
          style={{ background: "transparent" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          {/* Replace your current lights with these */}
          <ambientLight intensity={0.02} color="#000510" />        {/* near-black ambient */}

          {/* Key light — strong, tight, creates the bright edge catch */}
          <directionalLight position={[3, 6, 4]} intensity={2.5} color="#ffffff" />

          {/* Rim light from behind — creates the rainbow halo on edges */}
          <directionalLight position={[-4, 2, -6]} intensity={1.8} color="#4488ff" />

          {/* Under glow — the warm gold bounce from image 1 */}
          <pointLight position={[0, -2, 1]} intensity={1.2} color="#ff8833" distance={6} decay={2} />

          {/* Cool fill from left */}
          <pointLight position={[-3, 3, 2]} intensity={0.6} color="#0033ff" distance={8} decay={2} />

          <fog attach="fog" args={["#07131b", 5, 35]} />


          {/* sunset gives warm/cool contrast which feeds the iridescence */}
          <Environment preset="sunset" background={false} />

          <ScrollController>
            <Scene1 />
            {/* <Scene3 /> */}
          </ScrollController>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            makeDefault
          />

          <EffectComposer>
            <Bloom
              intensity={0.01}
              luminanceThreshold={0.01}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
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
      <Scene2 />
      {/* <div style={{ height: "200vh" }} /> */}
    </>
  );
}
