"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshTransmissionMaterial } from "@react-three/drei"

export default function Model(props: any) {
  const { scene } = useGLTF("/models/logo/Convrse_v1.glb");

  const group = useRef<THREE.Group>(null!);

  const targetRotation = useRef(0);
  const introProgress = useRef(0);
  const introDone = useRef(false);

  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          transmission: 1,
          thickness: 2,
          roughness: 0,
          metalness: 0,
          ior: 1.5,
          clearcoat: 1,
          reflectivity: 1,
        })
        child.material.side = THREE.DoubleSide;
        child.renderOrder = 10
        child.material.depthTest = true
        child.material.depthWrite = true
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  useEffect(() => {
    const handleScroll = () => {
      targetRotation.current = window.scrollY * 0;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}