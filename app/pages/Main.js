"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Model from "../components/Model";
import { OrbitControls } from "@react-three/drei";

export default function Main() {
  return (
    <>
      <div style={{ position: "fixed", inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={2} />

          <Model rotation={[0, Math.PI, 0]} scale={9.5} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
          <Environment preset="city" />
        </Canvas>
      </div>
      {/* Scroll space */}
      <div style={{ height: "400vh" }} />
    </>
  );
}