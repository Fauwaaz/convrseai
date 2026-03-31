"use client"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

// ─── Materials ───────────────────────────────────────────────────────────────
function applyBoneMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color:                     new THREE.Color("#0a0608"),
      metalness:                 0.9,
      roughness:                 0.2,
      iridescence:               1.0,
      iridescenceIOR:            1.9,
      iridescenceThicknessRange: [180, 650] as [number, number],
      transmission:              0.25,
      thickness:                 2.0,
      ior:                       1.6,
      clearcoat:                 1.0,
      clearcoatRoughness:        0.05,
      reflectivity:              1.0,
      envMapIntensity:           2.5,
      side:                      THREE.DoubleSide,
      depthWrite:                true,
      depthTest:                 true,
    })
    child.renderOrder = 2
  })
}

function applyChainMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color:                     new THREE.Color("#d0d8e0"),
      metalness:                 1.0,
      roughness:                 0.08,
      clearcoat:                 1.0,
      clearcoatRoughness:        0.05,
      reflectivity:              1.0,
      envMapIntensity:           2.0,
      iridescence:               0.3,
      iridescenceIOR:            1.5,
      iridescenceThicknessRange: [100, 400] as [number, number],
    })
    child.renderOrder = 2
  })
}

function applyPlateMaterial(obj: THREE.Object3D, tint: string) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color:        new THREE.Color(tint),
      roughness:    0.05,
      metalness:    0.1,
      transmission: 0.6,
      thickness:    0.5,
      transparent:  true,
      opacity:      0.85,
      side:         THREE.DoubleSide,
    })
  })
}

// ─── Flower material ──────────────────────────────────────────────────────────
function applyFlowerMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color:                     new THREE.Color("#1a0820"),
      metalness:                 0.3,
      roughness:                 0.4,
      iridescence:               0.8,
      iridescenceIOR:            1.6,
      iridescenceThicknessRange: [200, 700] as [number, number],
      clearcoat:                 0.6,
      clearcoatRoughness:        0.1,
      envMapIntensity:           1.8,
      side:                      THREE.DoubleSide,
      opacity:                   0.1,
    })
    child.renderOrder = 2
  })
}

function centerObject(obj: THREE.Object3D) {
  const box    = new THREE.Box3().setFromObject(obj)
  const center = box.getCenter(new THREE.Vector3())
  obj.position.sub(center)
}

function setY(g: THREE.Group, target: number) { g.position.y = target }
function lerpRotY(g: THREE.Group, target: number, alpha = 0.06) {
  if (Math.abs(g.rotation.y - target) > 0.0001)
    g.rotation.y += (target - g.rotation.y) * alpha
}

// ─── Spine ────────────────────────────────────────────────────────────────────
function Spine() {
  const { scene } = useGLTF("/models/assets/spine.glb")
  const groupRef = useRef<THREE.Group>(null!)

  const segments = useMemo(() => {
    return Array.from({ length: 1 }, (_, i) => {
      const clone = scene.clone(true)
      applyBoneMaterial(clone)
      centerObject(clone)   // fixes off-center GLB pivots
      return {
        object: clone,
        // ↓ ADJUST THIS: i * 1.1 = spacing between bones, -3 = vertical start offset
        position: new THREE.Vector3(0, i * 1.1 - 28, -5),
        rotation: new THREE.Euler(
          0,
          (i * Math.PI) / 1,   // ← twist per segment
          i % 2 === 0 ? 0 : 0
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
      1
    )
  })

  return (
    // ↓ ADJUST THIS: [x, y, z] — x=0 keeps spine dead center
    <group ref={groupRef} position={[0, 0, 5]}>
      {segments.map(({ object, position, rotation }, i) => (
        <primitive
          key={i}
          object={object}
          position={position}
          rotation={rotation}
          scale={1.8}   // ← ADJUST: overall bone size
        />
      ))}
    </group>
  )
}

// ─── Flowers — ONE instance, positioned as a group on the side ────────────────
function Flowers() {
  const { scene } = useGLTF("/models/assets/flower.glb")
  const groupRef  = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    applyFlowerMaterial(scene)
    // ── No centerObject — position controlled via primitive props below ──
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const s = window.scrollY / window.innerHeight
    setY(groupRef.current, s * 4)
    lerpRotY(groupRef.current, s * Math.PI * 0)
  })

  return (
    <group ref={groupRef} position={[0, 0, 5]}>
      <primitive
        object={scene}
        position={[-0.5, -25, -6]}   
        rotation={[0, 0.5, 0]}   
        scale={1.5}              // ← ADJUST: overall flower size 
      />
    </group>
  )
}


// ─── Plates ───────────────────────────────────────────────────────────────────
const PLATE_CONFIGS = [
  { pos: [-0.5,  -21, 0.2]   as [number,number,number], rot: [0,  -1, 0] as [number,number,number], tint: "#7a5a20", scale: 1 },
  // { pos: [ 3.2,  0.5, -0.5] as [number,number,number], rot: [0, -0.4,  0.06] as [number,number,number], tint: "#0a4a6a", scale: 1.3 },
  // { pos: [-3.8, -2.5, -0.8] as [number,number,number], rot: [0,  0.2,  0.04] as [number,number,number], tint: "#3a0a5a", scale: 1.1 },
  // { pos: [ -0.5,  -24.5, 0]   as [number,number,number], rot: [0, 0, 0] as [number,number,number], tint: "#0a2a4a", scale: 1.2 },
]

function Plates() {
  const { scene } = useGLTF("/models/assets/plates.glb")
  const groupRef  = useRef<THREE.Group>(null!)

  const plates = useMemo(() => {
    return PLATE_CONFIGS.map((p) => {
      const clone = scene.clone(true)
      applyPlateMaterial(clone, p.tint)
      return { ...p, object: clone }
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const s = window.scrollY / window.innerHeight
    setY(groupRef.current, s * 5)
    lerpRotY(groupRef.current, s * Math.PI * 0.08)
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
function Chains() {
  const { scene } = useGLTF("/models/assets/chain.glb")
  const groupRef  = useRef<THREE.Group>(null!)

  useLayoutEffect(() => { applyChainMaterial(scene) }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const s = window.scrollY / window.innerHeight
    setY(groupRef.current, s * 3.5)
    lerpRotY(groupRef.current, s * Math.PI * 0.06)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} position={[-0.2, -26.5, -0.2]} rotation={[0, 0, 0]} scale={1.5} />
    </group>
  )
}

// ─── Scene3 ───────────────────────────────────────────────────────────────────
export default function Scene3() {
  return (
    <group>
      <Spine />
      <Flowers />
      <Chains />
      <Plates />
    </group>
  )
}