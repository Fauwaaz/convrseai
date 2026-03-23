"use client"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

// ─── Materials ───────────────────────────────────────────────────────────────

function applyBoneMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),   // ← temp white to debug
      roughness: 0.3,
      metalness: 0.0,                      // ← metalness + no light = invisible
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 1,
    })
  })
}


function applyChainMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#8a8aaa"),        // brighter so chains are visible
      roughness: 0.2,
      metalness: 1.0,
      emissive: new THREE.Color("#4444aa"),     // emissive boost so they show up
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide,
    })
  })
}

function applyPlateMaterial(obj: THREE.Object3D, tint: string) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tint),
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    })
  })
}

function centerObject(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj)
  const center = box.getCenter(new THREE.Vector3())
  obj.position.sub(center)
}

// ─── Spine ────────────────────────────────────────────────────────────────────

function Spine() {
  const { scene } = useGLTF("/models/assets/bone.glb")
  const groupRef = useRef<THREE.Group>(null!)

  const segments = useMemo(() => {
    return Array.from({ length: 1 }, (_, i) => {
      const clone = scene.clone(true)
      applyBoneMaterial(clone)
      centerObject(clone)   // fixes off-center GLB pivots
      return {
        object: clone,
        // ↓ ADJUST THIS: i * 1.1 = spacing between bones, -3 = vertical start offset
        position: new THREE.Vector3(0, i * 1.1 - 3, 0),
        rotation: new THREE.Euler(
          0,
          (i * Math.PI) / 5,   // ← twist per segment
          i % 2 === 0 ? 0.05 : -0.05
        ),
      }
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scroll * 4,
      0.05
    )
  })

  return (
    // ↓ ADJUST THIS: [x, y, z] — x=0 keeps spine dead center
    <group ref={groupRef} position={[-6, -3, 0]}>
      {segments.map(({ object, position, rotation }, i) => (
        <primitive
          key={i}
          object={object}
          position={position}
          rotation={rotation}
          scale={1.5}   // ← ADJUST: overall bone size
        />
      ))}
    </group>
  )
}

// ─── Plates ───────────────────────────────────────────────────────────────────

const PLATE_CONFIGS = [
  // ↓ ADJUST THESE: [x, y, z] pos — negative x = left, positive x = right
  { pos: [-3.5,  1.0, -1]   as [number,number,number], rot: [0,  0.3, -0.08] as [number,number,number], tint: "#7a5a20", scale: 1.4 },
  { pos: [ 3.2,  0.5, -0.5] as [number,number,number], rot: [0, -0.4,  0.06] as [number,number,number], tint: "#0a4a6a", scale: 1.3 },
  { pos: [-3.8, -2.5, -0.8] as [number,number,number], rot: [0,  0.2,  0.04] as [number,number,number], tint: "#3a0a5a", scale: 1.1 },
  { pos: [ 3.5, -2.8, -1]   as [number,number,number], rot: [0, -0.3, -0.05] as [number,number,number], tint: "#0a2a4a", scale: 1.2 },
]

function Plates() {
  const { scene } = useGLTF("/models/assets/plate.glb")
  const groupRef = useRef<THREE.Group>(null!)

  const plates = useMemo(() => {
    return PLATE_CONFIGS.map((p) => {
      const clone = scene.clone(true)
      applyPlateMaterial(clone, p.tint)
      return { ...p, object: clone }
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scroll * 5,
      0.04
    )
  })

  return (
    <group ref={groupRef}>
      {plates.map((p, i) => (
        <primitive key={i} object={p.object} position={p.pos} rotation={p.rot} scale={p.scale} />
      ))}
    </group>
  )
}

// ─── Chains ───────────────────────────────────────────────────────────────────

const CHAIN_CONFIGS = [
  // ↓ ADJUST THESE: connect spine (x≈0) to plates (x≈±3.5)
  { pos: [-1.8,  1.2, 0] as [number,number,number], rot: [0, 0,  0.6] as [number,number,number], scale: [3.0, 1, 1] as [number,number,number] },
  { pos: [ 1.8,  0.5, 0] as [number,number,number], rot: [0, 0, -0.5] as [number,number,number], scale: [2.8, 1, 1] as [number,number,number] },
  { pos: [-2.0, -2.2, 0] as [number,number,number], rot: [0, 0,  0.4] as [number,number,number], scale: [3.0, 1, 1] as [number,number,number] },
  { pos: [ 2.0, -2.5, 0] as [number,number,number], rot: [0, 0, -0.4] as [number,number,number], scale: [2.8, 1, 1] as [number,number,number] },
]

function Chains() {
  const { scene } = useGLTF("/models/assets/chain.glb")
  const groupRef = useRef<THREE.Group>(null!)

  const chains = useMemo(() => {
    return CHAIN_CONFIGS.map((c) => {
      const clone = scene.clone(true)
      applyChainMaterial(clone)
      return { ...c, object: clone }
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scroll * 5,
      0.04
    )
  })

  return (
    <group ref={groupRef}>
      {chains.map((c, i) => (
        <primitive key={i} object={c.object} position={c.pos} rotation={c.rot} scale={c.scale} />
      ))}
    </group>
  )
}


// ─── Scene3 ───────────────────────────────────────────────────────────────────

export default function Scene3() {
  const groupRef = useRef<THREE.Group>(null!)

  // useFrame(() => {
  //   if (!groupRef.current) return
  //   const scroll = window.scrollY / window.innerHeight
  //   groupRef.current.visible = scroll > 0.9
  // })

  return (
    <group ref={groupRef}>
      <Spine />
      <Chains />
      <Plates />
    </group>
  )
}