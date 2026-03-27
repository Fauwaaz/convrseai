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
      color:              new THREE.Color("#0a0608"),  // near-black base — reflections do the work
      metalness:          0.9,
      roughness:          0.2,                        // near-mirror for sharp reflections

      // ── Thin-film iridescence — the pink/cyan/purple shimmer ───────────────
      iridescence:                 1.0,
      iridescenceIOR:              1.9,
      iridescenceThicknessRange:   [180, 650] as [number, number],
      // lower min = more blue/cyan, higher max = more pink/red shift

      // ── Partial glass — lets dark background show through ─────────────────
      transmission:   0.25,
      thickness:      2.0,
      ior:            1.6,

      clearcoat:          1.0,
      clearcoatRoughness: 0.05,
      reflectivity:       1.0,
      envMapIntensity:    2.5,

      side:       THREE.DoubleSide,
      depthWrite: true,
      depthTest:  true,
    })
    child.renderOrder = 2
  })
}


function applyChainMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#d0d8e0"),
      metalness:          1.0,
      roughness:          0.08,
      clearcoat:          1.0,
      clearcoatRoughness: 0.05,
      reflectivity:       1.0,
      envMapIntensity:    2.0,
      iridescence:        0.3,
      iridescenceIOR:     1.5,
      iridescenceThicknessRange: [100, 400] as [number, number],
    })
    child.renderOrder = 2
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
      0.05
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

// ─── Chain configs — circular wrap around spine center ────────────────────────
// Spine is at x=0, z=-5. Chains orbit around it in an oval ring.
// Each chain segment is tangent to the ring at its position angle.

const RING_RADIUS_X = 2.2   // oval width  — how far left/right
const RING_RADIUS_Z = 1.4   // oval depth  — how far front/back

// Generate N chain segments evenly spaced around the oval
function buildChainRing(scene: THREE.Group, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2

    // Position on oval
    const x = Math.cos(angle) * RING_RADIUS_X
    const z = Math.sin(angle) * RING_RADIUS_Z - 5   // -5 = spine Z offset

    // Tangent angle — chain links face along the ring direction
    const tangentAngle = Math.atan2(
      Math.cos(angle) * RING_RADIUS_Z,
      -Math.sin(angle) * RING_RADIUS_X
    )

    const clone = scene.clone(true)
    applyChainMaterial(clone)

    return {
      object:    clone,
      pos:       [x, 0, z]              as [number, number, number],
      rot:       [0, tangentAngle, 0]   as [number, number, number],
      scale:     [1.1, 1.0, 1.0]        as [number, number, number],
    }
  })
}

// ─── Vertical chain strands — hang from top and bottom of spine ───────────────
const STRAND_CONFIGS = [
  // Drape from spine top downward — x offset keeps them wrapping the body
  { pos: [-2.0,  3, -5] as [number,number,number], rot: [0.15, 0,  0.3] as [number,number,number], scale: [1, 4.5, 1] as [number,number,number] },
  { pos: [ 2.0,  3, -5] as [number,number,number], rot: [0.15, 0, -0.3] as [number,number,number], scale: [1, 4.5, 1] as [number,number,number] },
  { pos: [-1.0,  2, -3.8] as [number,number,number], rot: [0.3,  0.4, 0.15] as [number,number,number], scale: [1, 3.5, 1] as [number,number,number] },
  { pos: [ 1.0,  2, -3.8] as [number,number,number], rot: [0.3, -0.4, -0.15] as [number,number,number], scale: [1, 3.5, 1] as [number,number,number] },
  // Drape below spine
  { pos: [-1.5, -4, -5] as [number,number,number], rot: [-0.1, 0,  0.2] as [number,number,number], scale: [1, 3.0, 1] as [number,number,number] },
  { pos: [ 1.5, -4, -5] as [number,number,number], rot: [-0.1, 0, -0.2] as [number,number,number], scale: [1, 3.0, 1] as [number,number,number] },
]

function Chains() {
  const { scene } = useGLTF("/models/assets/chain.glb")
  const groupRef  = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    applyChainMaterial(scene)
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scroll * 3.5,
      0.05
    )
  })

  return (
    <group ref={groupRef}>
      {/* ── Single chain, scaled and positioned to wrap around spine ── */}
      <primitive
        object={scene}
        position={[0, -26, 0]}   // centered on spine
        rotation={[0, 0, 0]}
        scale={1.5}
      />
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