"use client"

import { useGLTF, useEnvironment } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef, useState, useEffect } from "react"
import * as THREE from "three"

// ─── Materials ────────────────────────────────────────────────────────────────
const NATURE_MAT = new THREE.MeshPhysicalMaterial({
  color:           new THREE.Color("#2d4a35"),  // ← dark muted forest green, not bright #a8d5a2
  roughness:       0.8,                          // ← matte, not glassy
  metalness:       0.0,
  transmission:    0.0,                          // ← OFF — transmission is why it glows bright
  transparent:     true,
  opacity:         0.85,                         // ← mostly opaque, dark feel
  ior:             1.4,
  reflectivity:    0.1,                          // ← minimal shine
  envMapIntensity: 0.3,                          // ← was 1.5, killing the overbright env bounce
  side:            THREE.DoubleSide,
  depthWrite:      false,
  depthTest:       true,
})

const LOGO_MAT = new THREE.MeshPhysicalMaterial({
  color:              new THREE.Color("#080808"),  // near-black base — dark interior
  metalness:          1.0,
  roughness:          0.0,                         // perfectly smooth for sharp reflections
  transmission:       0.6,                         // partial see-through like glass
  thickness:          3.0,                         // thick glass = more refraction
  ior:                2.4,                         // diamond-like — high refraction
  clearcoat:          1.0,
  clearcoatRoughness: 0.0,
  reflectivity:       1.0,
  envMapIntensity:    3.0,                         // strong env reflection = rainbow sheen
  iridescence:        1.0,                         // ← THIS creates the rainbow edge
  iridescenceIOR:     2.2,
  iridescenceThicknessRange: [100, 800] as [number, number], // thin-film interference = color shift
  side:               THREE.DoubleSide,
  depthWrite:         true,
  depthTest:          true,
})

function applyMat(
  obj: THREE.Object3D,
  mat: THREE.Material,
  renderOrder: number,
) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material      = mat
    child.renderOrder   = renderOrder
    child.castShadow    = false
    child.receiveShadow = false
  })
}

// ─── Scroll ───────────────────────────────────────────────────────────────────
let _scroll = 0, _dirty = true
if (typeof window !== "undefined")
  window.addEventListener("scroll", () => { _dirty = true }, { passive: true })

function getScroll() {
  if (_dirty) { _scroll = window.scrollY / window.innerHeight; _dirty = false }
  return _scroll
}

function lerpY(g: THREE.Group, target: number) {
  const diff = target - g.position.y
  if (Math.abs(diff) > 0.0005)
    g.position.y += diff * 0.08
}

// ─── Scroll visibility hook ───────────────────────────────────────────────────
// Returns true when scrollY < threshold — no polling, event-driven only
function useScrollVisible(threshold = 1000) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Set initial state correctly (e.g. page loaded mid-scroll)
    setVisible(window.scrollY < threshold)

    const handler = () => setVisible(window.scrollY < threshold)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [threshold])

  return visible
}

// ─── Nature ───────────────────────────────────────────────────────────────────
function Nature() {
  const { scene: treeSceneA }  = useGLTF("/models/assets/tree.glb")
  const { scene: treeSceneB }  = useGLTF("/models/assets/tree.glb")
  const { scene: grassSceneA } = useGLTF("/models/assets/grass.glb")
  const { scene: grassSceneB } = useGLTF("/models/assets/grass.glb")

  const backTreeRef   = useRef<THREE.Group>(null!)
  const frontTreeRef  = useRef<THREE.Group>(null!)
  const backGrassRef  = useRef<THREE.Group>(null!)
  const frontGrassRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    applyMat(treeSceneA,  NATURE_MAT, 0)
    applyMat(grassSceneA, NATURE_MAT, 0)
    applyMat(treeSceneB,  NATURE_MAT, 20)
    applyMat(grassSceneB, NATURE_MAT, 20)
  }, [treeSceneA, treeSceneB, grassSceneA, grassSceneB])

  useFrame(() => {
    const s = getScroll()
    if (backTreeRef.current)   lerpY(backTreeRef.current,   s * 6)
    if (frontTreeRef.current)  lerpY(frontTreeRef.current,  s * 6)
    if (backGrassRef.current)  lerpY(backGrassRef.current,  s * 3)
    if (frontGrassRef.current) lerpY(frontGrassRef.current, s * 3)
  })

  return (
    <>
      <group ref={backTreeRef}>
        <primitive object={treeSceneA}  position={[1, -9, 3.5]}    rotation={[0,  Math.PI * 0.3, 0]} scale={0.7} />
      </group>
      <group ref={backGrassRef}>
        <primitive object={grassSceneA} position={[-1.8, -4, -0.5]} rotation={[0,  Math.PI * 0.1, 0]} scale={0.6} />
      </group>
      <group ref={frontTreeRef}>
        <primitive object={treeSceneB}  position={[2.1, -9, 1]}    rotation={[0, -Math.PI * 0.3, 0]} scale={0.7} />
      </group>
      <group ref={frontGrassRef}>
        <primitive object={grassSceneB} position={[3, -4, -0.5]}   rotation={[0, -Math.PI * 0.1, 0]} scale={0.6} />
      </group>
    </>
  )
}

// ─── Model ────────────────────────────────────────────────────────────────────
function Model(props: any) {
  const { scene }     = useGLTF("/models/logo/Convrse_v1.glb")
  const group         = useRef<THREE.Group>(null!)
  const introProgress = useRef(0)
  const introDone     = useRef(false)

  useLayoutEffect(() => {
    applyMat(scene, LOGO_MAT, 10)
    const box = new THREE.Box3().setFromObject(scene)
    scene.position.sub(box.getCenter(new THREE.Vector3()))
  }, [scene])

  useFrame((_, delta) => {
    if (!group.current) return
    if (!introDone.current) {
      introProgress.current += delta * 0.4
      const t     = Math.min(introProgress.current, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      group.current.rotation.y = THREE.MathUtils.degToRad(160) * (1 - eased)
      group.current.scale.setScalar(100 - (100 - 9.5) * eased)
      if (t >= 1) introDone.current = true
      return
    }
    if (Math.abs(group.current.rotation.y) > 0.0001)
      group.current.rotation.y *= 0.92
  })

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  )
}

function Wire() {
  const { scene } = useGLTF("/models/wires.glb")
  const env       = useEnvironment({ preset: "sunset" })
  const ref       = useRef<THREE.Group>(null!)
  const progress  = useRef(0)

  useLayoutEffect(() => {
    const wireMat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#111111"),  // dark base — reflections do the work
      metalness:          1.0,
      roughness:          0.05,                        // near-mirror
      clearcoat:          1.0,
      clearcoatRoughness: 0.0,
      envMap:             env,
      envMapIntensity:    4.0,                         // strong chrome reflections
      reflectivity:       1.0,
      iridescence:        0.4,                         // subtle rainbow on wire edges
      iridescenceIOR:     1.8,
      iridescenceThicknessRange: [200, 600] as [number, number],
      transmission:       0.0,                         // wire is opaque chrome
      depthWrite:         true,
      depthTest:          true,
    })
    scene.traverse((child: any) => {
      if (!child.isMesh) return
      child.geometry.computeVertexNormals()
      child.material    = wireMat
      child.renderOrder = 5
    })
  }, [scene, env])

  useFrame((_, delta) => {
    if (!ref.current) return
    progress.current += delta * 0.4
    const eased = THREE.MathUtils.smoothstep(Math.min(progress.current, 1), 0, 1)
    ref.current.position.y = -4.7 + eased * 3
    ref.current.rotation.y = eased * Math.PI * 1.45
  })

  return (
    <primitive ref={ref} object={scene} scale={0.5} position={[0.03, -3, 0.08]} />
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export default function Scene1() {
  const logoVisible = useScrollVisible(1500)  // false when scrollY ≥ 1000px

  return (
    <>
      <Nature />

      {/* Unmounted entirely when scrolled past 1000px — zero GPU cost */}
      {logoVisible && (
        <group position={[0, 0, 0]}>
          <Model rotation={[0, Math.PI, 0]} />
          <Wire />
        </group>
      )}
    </>
  )
}