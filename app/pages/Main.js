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

      {/* <div className="projector-layer">
        <video autoPlay loop muted playsInline>
          <source src="/video/reel.mp4" type="video/mp4" />
        </video>
      </div> */}
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
          <ambientLight intensity={0.005} color="#000000" />

          {/* ── CENTER CORE — white-green emit from logo position ─────────── */}
          <pointLight position={[0, 0.5, 1]} intensity={6} color="#ccffdd" distance={10} decay={2} />
          <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" distance={5} decay={2.5} />

          {/* ── GROUND POOL — warm yellow-green, lights trees from below ──── */}
          <pointLight position={[0, -3, 0]} intensity={14} color="#aaff00" distance={12} decay={1.5} />
          <pointLight position={[0, -5, -1]} intensity={8} color="#88cc00" distance={18} decay={1.2} />

          {/* ── TREE SIDE FILL — very dim green, just enough to see shape ─── */}
          <pointLight position={[-5, -1, -2]} intensity={2} color="#224400" distance={12} decay={2} />
          <pointLight position={[5, -1, -2]} intensity={2} color="#224400" distance={12} decay={2} />

          {/* ── NO directional lights — pure point source look ───────────── */}

          {/* Fog — pure black, close start so edges fall off fast */}
          <fog attach="fog" args={["#000000", 5, 22]} />

          <Environment preset="night" background={false} />

          <ScrollController>
            <Scene1 />
            <Scene3 />
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
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              mipmapBlur
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
      <div style={{ height: "350vh" }} />
    </>
  );
}
