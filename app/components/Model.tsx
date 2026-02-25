"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Model(props: any) {
  const { scene } = useGLTF("/models/logo/Convrse_v1.glb");
  const group = useRef<any>(null);
  const targetRotation = useRef(0);
  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      console.log(child);
    });
  }, [scene]);
  

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  useEffect(() => {
    const handleScroll = () => {
      targetRotation.current = window.scrollY * -0.0010;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetRotation.current,
        0.08
      );
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} {...props} />
    </group>
  );
}