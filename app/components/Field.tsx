"use client";

import { useRef, ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Field({ children }: { children: ReactNode }) {
  const field = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const { mouse } = state;

    field.current.rotation.y = THREE.MathUtils.lerp(
      field.current.rotation.y,
      mouse.x * 0.2,
      0.05
    );

    field.current.rotation.x = THREE.MathUtils.lerp(
      field.current.rotation.x,
      -mouse.y * 0.15,
      0.05
    );
  });

  return <group ref={field}>{children}</group>;
}