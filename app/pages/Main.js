"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Model from "../components/Model";

export default function Main() {
  return (
    <>
      <div style={{ position: "fixed", inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={100} />
          <directionalLight position={[5, 20, 5]} intensity={500} />

          <Model rotation={[0, Math.PI, 0]} scale={9.5} />

          <Environment preset="studio" />
        </Canvas>
      </div>
      <div className="flex items-end justify-center min-h-screen">
        <h1 className="text-white font-bold text-4xl uppercase p-5">Convrse AI</h1>
      </div>
      {/* Scroll space */}
      <div style={{ height: "500vh" }} />
    </>
  );
}