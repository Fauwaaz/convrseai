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
  transmission: 1,
  thickness:    2,
  roughness:    0,
  metalness:    0,
  ior:          1.5,
  clearcoat:    1,
  reflectivity: 1,
  side:         THREE.DoubleSide,
  depthWrite:   true,
  depthTest:    true,
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


// Drop this inside ScrollController, behind Nature
function DarkBackground() {
  return (
    <mesh position={[0, 0, -8]} renderOrder={-10}>
      <planeGeometry args={[40, 22]} />
      <shaderMaterial
        depthWrite={false}
        transparent
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center * vec2(1.8, 1.0));  // oval vignette
            
            // Dark forest floor center, pure black edges
            vec3 centerColor = vec3(0.02, 0.06, 0.03);   // very dark green
            vec3 edgeColor   = vec3(0.0,  0.0,  0.0);    // pure black
            
            float vignette = smoothstep(0.0, 0.7, dist);
            vec3 col = mix(centerColor, edgeColor, vignette);
            
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
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

// ─── Wire ─────────────────────────────────────────────────────────────────────
function Wire() {
  const { scene } = useGLTF("/models/wires.glb")
  const env       = useEnvironment({ preset: "sunset" })
  const ref       = useRef<THREE.Group>(null!)
  const progress  = useRef(0)

  useLayoutEffect(() => {
    const wireMat = new THREE.MeshPhysicalMaterial({
      color:              "#ffffff",
      metalness:          1,
      roughness:          0.12,
      clearcoat:          1,
      clearcoatRoughness: 0,
      envMap:             env,
      envMapIntensity:    2,
      reflectivity:       1,
      transmission:       0.15,
      thickness:          0.5,
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