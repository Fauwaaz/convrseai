"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { Text } from "@react-three/drei"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"


const RoundedVideoMaterial = shaderMaterial(
  {
    uTexture: null,
    uRadius: 0.08,
  },

  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,

  `
  uniform sampler2D uTexture;
  uniform float uRadius;
  varying vec2 vUv;

  float roundedBox(vec2 uv, float radius) {
    vec2 q = abs(uv - 0.5) - 0.5 + radius;
    return length(max(q, 0.0)) - radius;
  }

  void main() {
    float mask = roundedBox(vUv, uRadius);

    if (mask > 0.0) discard;

    vec3 color = texture2D(uTexture, vUv).rgb;

    gl_FragColor = vec4(color, 0.5);
  }
  `
)

extend({ RoundedVideoMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      roundedVideoMaterial: any
    }
  }
}

// ─── Materials ───────────────────────────────────────────────────────────────
function applyBoneMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0a0608"),
      metalness: 0.9,
      roughness: 0.2,
      iridescence: 1.0,
      iridescenceIOR: 1.9,
      iridescenceThicknessRange: [180, 650] as [number, number],
      transmission: 0.25,
      thickness: 2.0,
      ior: 1.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
      envMapIntensity: 2.5,
      side: THREE.DoubleSide,
      depthWrite: true,
      depthTest: true,
    })
    child.renderOrder = 2
  })
}

function applyChainMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d0d8e0"),
      metalness: 1.0,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      iridescence: 0.3,
      iridescenceIOR: 1.5,
      iridescenceThicknessRange: [100, 400] as [number, number],
    })
    child.renderOrder = 2
  })
}

function applyPlateMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0a4a6a"),
      thickness: 1.0,
      ior: 1.4,
      opacity: 0.5,
      roughness: 0.15,       // too high = foggy mess
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 4,
      transparent: true,
    })
  })
}

// ─── Flower material ──────────────────────────────────────────────────────────
function applyFlowerMaterial(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1a0820"),
      metalness: 0.3,
      roughness: 0.4,
      iridescence: 0.8,
      reflectivity: 0.0,
      iridescenceIOR: 0.56,
      iridescenceThicknessRange: [200, 700] as [number, number],
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide,
      opacity: 0.1,
    })
    child.renderOrder = 2
  })
}

function centerObject(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj)
  const center = box.getCenter(new THREE.Vector3())
  obj.position.sub(center)
}

function setY(g: THREE.Group, target: number) { g.position.y = target }
function lerpRotY(g: THREE.Group, target: number, alpha = 0.06) {
  if (Math.abs(g.rotation.y - target) > 0.0001)
    g.rotation.y += (target - g.rotation.y) * alpha
}

// ─── Spine ───────────────────────────────────────────────────────────────────
const SPINE_POSITION = new THREE.Vector3(0.6, -26, 0.6)  // x=left/right, y=up/down, z=front/back
const SPINE_ROTATION = new THREE.Euler(0, 0, 0)        // x/y/z rotation in radians
const SPINE_SCALE = 1.7
const SPINE_SCROLL_SPEED = 5                          // how fast it moves on scroll

function Spine() {
  const { scene } = useGLTF("/models/assets/building.glb")
  const groupRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    // Material only — NO centerObject, NO position manipulation
    applyBoneMaterial(scene)
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight

    // Y scroll — direct, no ease
    groupRef.current.position.y = scroll * SPINE_SCROLL_SPEED

    // X rotation tilt on scroll
    const targetRotX = scroll * -Math.PI * 0.08
    groupRef.current.rotation.y += (targetRotX - groupRef.current.rotation.y) * 0
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={SPINE_POSITION}
        rotation={SPINE_ROTATION}
        scale={SPINE_SCALE}
      />
    </group>
  )
}

// ─── Flowers — ONE instance, positioned as a group on the side ────────────────
function Flowers() {
  const { scene } = useGLTF("/models/assets/flower.glb")
  const groupRef = useRef<THREE.Group>(null!)

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
        position={[-0.5, -23, -6]}
        rotation={[0, 0.5, 0]}
        scale={1.5}              // ← ADJUST: overall flower size 
      />
    </group>
  )
}

// ─── Plates ───────────────────────────────────────────────────────────────────
const PLATE_DATA = [
  {
    pos: [-0.5, -22, -0.2] as [number, number, number],
    rot: [0, -3.2, 0] as [number, number, number],
    tint: "#0a4a6a",
    scale: 0.8,
    label: "WALKTHROUGHS",
    video: "/video/walkthroughs.webm",
  },
  {
    pos: [0.5, -23, -0.5] as [number, number, number],
    rot: [0, -4.6, 0.01] as [number, number, number],
    tint: "#0a4a6a",
    scale: 0.8,
    label: "EXPERIENCES",
    video: "/video/scale-models.webm",
  },
]

type PlateConfig = typeof PLATE_DATA[0]
type PlateWithObject = PlateConfig & { object: THREE.Object3D }

function useVideoTexture(src: string) {
  const video = useMemo(() => {
    const vid = document.createElement("video")

    vid.src = src

    vid.muted = true
    vid.loop = true
    vid.playsInline = true
    vid.autoplay = true
    vid.preload = "auto"

    vid.setAttribute("webkit-playsinline", "true")

    vid.load() // 🔥 force load

    vid.onloadeddata = () => {
      console.log("VIDEO LOADED ✅", vid.readyState)
      vid.play().catch(() => { })
    }

    vid.onerror = (e) => {
      console.error("VIDEO FAILED ❌", src, e)
    }

    return vid
  }, [src])

  const texture = useMemo(() => {
    const tex = new THREE.VideoTexture(video)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    return tex
  }, [video])

  return texture
}

function PlateWithVideo({ config }: { config: PlateWithObject }) {
  const texture = useVideoTexture(config.video)

  const material = useMemo(() => {
    const mat = new RoundedVideoMaterial()
    mat.toneMapped = false
    mat.uniforms.uRadius.value = 0.08
    return mat
  }, [])

  useEffect(() => {
    material.uniforms.uTexture.value = texture
  }, [material, texture])

  useEffect(() => {
    return () => material.dispose()
  }, [material])

  return (
    <group position={config.pos} rotation={config.rot} scale={config.scale}>
      {/* plate mesh */}
      <primitive object={config.object} />

      <mesh position={[-0.42, 6.25, -2.08]} rotation={[0, Math.PI - 0.07, 0]} scale={1.1}>
        <planeGeometry args={[1.6, 1.1]} />
        <primitive object={material} />
      </mesh>

      {/* label — sits just below the plate bottom edge (-0.63 units) */}
      <Text
        position={[-0.45, 6.4, -2.2]}
        rotation={[0, Math.PI - 0.05, 0]}
        fontSize={0.12}
        font="/fonts/CrystalBold.ttf"
        color="#fff"
        anchorX="center"
        anchorY="top"
        letterSpacing={0.14}
        maxWidth={2}
      >
        {config.label}
      </Text>
    </group>
  )
}

function Plates() {
  const { scene } = useGLTF("/models/assets/plate.glb")
  const groupRef = useRef<THREE.Group>(null!)

  const plates = useMemo(() => {
    return PLATE_DATA.map((p) => {
      const clone = scene.clone(true)
      applyPlateMaterial(clone)
      return { ...p, object: clone }
    })
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const s = window.scrollY / window.innerHeight
    setY(groupRef.current, s * 5)
    lerpRotY(groupRef.current, s * Math.PI * 0)
  })

  return (
    <group ref={groupRef}>
      {plates.map((p, i) => (
        <PlateWithVideo key={i} config={p} />
      ))}
    </group>
  )
}

// ─── Chains ───────────────────────────────────────────────────────────────────
function Chains() {
  const { scene } = useGLTF("/models/assets/chain.glb")
  const groupRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => { applyChainMaterial(scene) }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const s = window.scrollY / window.innerHeight
    setY(groupRef.current, s * 3.5)
    lerpRotY(groupRef.current, s * Math.PI * 0.06)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} position={[0.3, -26.5, -0.2]} rotation={[0, 0, 0]} scale={1.5} />
    </group>
  )
}

const RINGS_POSITION = [0, -13, -2] as const   // [x, y, z]
const RINGS_SCALE = 1.8
const RINGS_ROTATION = [0, 0, 0] as const     // static base rotation
const RINGS_SPIN = 0.01                   // idle rotation speed

function OuterRings() {
  const { scene } = useGLTF("/models/assets/outer-rings.glb")
  const groupRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    // Material only — NO position manipulation
    scene.traverse((child: any) => {
      if (!child.isMesh) return
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#aaccff"),
        metalness: 0.6,
        roughness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
        envMapIntensity: 2.5,
        iridescence: 0.5,
        iridescenceIOR: 1.8,
        iridescenceThicknessRange: [150, 600] as [number, number],
        side: THREE.DoubleSide,
        depthWrite: true,
        depthTest: true,
      })
      child.renderOrder = 3
    })
  }, [scene])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const scroll = window.scrollY / window.innerHeight
    groupRef.current.position.y = RINGS_POSITION[1] + scroll * 4
    groupRef.current.rotation.y = clock.getElapsedTime() * RINGS_SPIN
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        position={RINGS_POSITION}
        scale={RINGS_SCALE}
        rotation={RINGS_ROTATION}
      />
    </group>
  )
}

export default function Scene3() {
  const groupRef = useRef<THREE.Group>(null!)

  return (
    <group ref={groupRef}>
      <Spine />
      <OuterRings />
      {/* <Flowers /> */}
      {/* <Chains /> */}
      <Plates />
    </group>
  )
}