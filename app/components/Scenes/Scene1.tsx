"use client"

import { useGLTF, useEnvironment } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from "react"
import * as THREE from "three"

// ─── Materials ────────────────────────────────────────────────────────────────
const NATURE_MAT = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#89CFF0"),   // darker base — light does the work
  roughness: 0.9,                           // matte — absorbs and scatters
  metalness: 0.0,
  transmission: 0.0,
  transparent: true,
  opacity: 0.95,
  reflectivity: 0.0,                           // zero shine — pure diffuse
  envMapIntensity: 0.05,                          // nearly off — no env bounce
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: true,
})

const LOGO_MAT = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ffffff"),  // pure white base
  metalness: 0.6,
  roughness: 0,
  transmission: 0.0,                         // fully opaque — no glass
  clearcoat: 1.0,
  clearcoatRoughness: 0.0,
  reflectivity: 1.0,
  envMapIntensity: 2.0,
  iridescence: 0.0,                         // OFF — no color shift
  side: THREE.DoubleSide,
  depthWrite: true,
  depthTest: true,
})

function applyMat(
  obj: THREE.Object3D,
  mat: THREE.Material,
  renderOrder: number,
) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = mat
    child.renderOrder = renderOrder
    child.castShadow = false
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

function setY(g: THREE.Group, target: number) {
  g.position.y = target   // instant, no easing
}

// ─── Lerp only for rotation ───────────────────────────────────────────────────
function lerpRotY(g: THREE.Group, target: number, alpha = 0.06) {
  if (Math.abs(g.rotation.y - target) > 0.0001)
    g.rotation.y += (target - g.rotation.y) * alpha
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


function FogVolume() {
  const { scene } = useGLTF("/models/assets/fog.glb")
  const g1 = useRef<THREE.Group>(null!)
  const g2 = useRef<THREE.Group>(null!)
  const g3 = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    const applyFogMat = (obj: THREE.Object3D) => {
      obj.traverse((child: any) => {
        if (!child.isMesh) return
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#aaffcc"),
          transparent: true,
          opacity: 0.055,
          depthWrite: false,
          roughness: 1.0,
          metalness: 0.0,
          side: THREE.DoubleSide,
          envMapIntensity: 0.0,
        })
        child.renderOrder = 3
        child.castShadow = false
        child.receiveShadow = false
      })
    }

    applyFogMat(scene)
    applyFogMat(scene.clone())
    applyFogMat(scene.clone())
  }, [scene])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Slow drift — fog layers move independently
    if (g1.current) {
      g1.current.position.x = Math.sin(t * 0.08) * 0.4
      g1.current.position.z = Math.cos(t * 0.06) * 0.3
    }
    if (g2.current) {
      g2.current.position.x = Math.sin(t * 0.05 + 1) * 0.6
      g2.current.rotation.y = t * 0.02
    }
    if (g3.current) {
      g3.current.position.x = Math.cos(t * 0.07 + 2) * 0.5
      g3.current.rotation.y = -t * 0.015
    }
  })

  const clone1 = useMemo(() => scene.clone(true), [scene])
  const clone2 = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    const fogMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#aaffcc"),
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide,
      envMapIntensity: 0.0,
    })
      ;[scene, clone1, clone2].forEach(s =>
        s.traverse((c: any) => {
          if (!c.isMesh) return
          c.material = fogMat
          c.renderOrder = 3
          c.castShadow = false
        })
      )
  }, [scene, clone1, clone2])

  return (
    <>
      {/* Ground gold pool layer */}
      <group ref={g1} position={[0, -3.2, 0]}>
        <primitive object={scene} scale={[3.5, 1.2, 3.5]} />
      </group>

      {/* Mid teal scatter layer */}
      <group ref={g2} position={[0, -1.8, -1]} rotation={[0, Math.PI * 0.25, 0]}>
        <primitive object={clone1} scale={[2.8, 0.9, 2.2]} />
      </group>

      {/* Deep back atmosphere */}
      <group ref={g3} position={[0, -0.8, -3]} rotation={[0, Math.PI * 0.5, 0]}>
        <primitive object={clone2} scale={[4.5, 1.0, 2.5]} />
      </group>
    </>
  )
}

// ─── Scroll state — shared lerped value ──────────────────────────────────────
let _rawScroll = 0
let _lerpedScroll = 0
if (typeof window !== "undefined")
  window.addEventListener("scroll", () => { _rawScroll = window.scrollY / window.innerHeight }, { passive: true })

// Call once per frame to advance the lerped scroll
function tickLerpedScroll(alpha = 0.08) {
  _lerpedScroll += (_rawScroll - _lerpedScroll) * alpha
  return _lerpedScroll
}

// ─── Nature ───────────────────────────────────────────────────────────────────
function Nature() {
  const { scene: treeSceneA } = useGLTF("/models/assets/tree.glb")
  const { scene: treeSceneB } = useGLTF("/models/assets/tree.glb")
  const { scene: grassSceneA } = useGLTF("/models/assets/grass.glb")
  const { scene: grassSceneB } = useGLTF("/models/assets/grass.glb")

  const backTreeRef = useRef<THREE.Group>(null!)
  const frontTreeRef = useRef<THREE.Group>(null!)
  const backGrassRef = useRef<THREE.Group>(null!)
  const frontGrassRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    applyMat(treeSceneA, NATURE_MAT, 10)
    applyMat(grassSceneA, NATURE_MAT, 0)
    applyMat(treeSceneB, NATURE_MAT, 20)
    applyMat(grassSceneB, NATURE_MAT, 20)
  }, [treeSceneA, treeSceneB, grassSceneA, grassSceneB])

  useFrame(() => {
    // ── Shared lerped scroll — same value as particles ────────────────────
    const s = tickLerpedScroll(0.6)

    if (backTreeRef.current) setY(backTreeRef.current, s * 6)
    if (frontTreeRef.current) setY(frontTreeRef.current, s * 7)
    if (backGrassRef.current) setY(backGrassRef.current, s * 3)
    if (frontGrassRef.current) setY(frontGrassRef.current, s * 3)

    // 🔥 normalize scroll range (important)
    const start = 0.2
    const end = 2.2

    const raw = THREE.MathUtils.clamp((s - start) / (end - start), 0, 1)

    // 🔥 ease curve (organic feel)
    const eased = 1 - Math.pow(1 - raw, 3)

    // 🔥 subtle breathing motion
    const t = performance.now() * 0.001
    const drift = Math.sin(t * 0.6) * 0.08

    // 🔥 final rotation target
    const rotTarget = eased * Math.PI * 0.8 + drift
    if (backTreeRef.current)
      lerpRotY(backTreeRef.current, Math.PI * 0.3 + rotTarget, 0.05)

    if (frontTreeRef.current)
      lerpRotY(frontTreeRef.current, Math.PI * -0.1 + rotTarget * 1.1, 0.06)

    if (backGrassRef.current)
      lerpRotY(backGrassRef.current, Math.PI * 0.1 + rotTarget * 0.7, 0.04)

    if (frontGrassRef.current)
      lerpRotY(frontGrassRef.current, Math.PI * -0.1 + rotTarget * 0.6, 0.04)
  })

  return (
    <>
      <group ref={frontGrassRef}>
        <primitive object={grassSceneB} position={[0, -4, 0.5]} rotation={[0, -Math.PI * 0.1, 0]} scale={0.6} />
      </group>
    </>
  )
}

// ─── Tune these ───────────────────────────────────────────────────────────────
const PARTICLES_POSITION = [-4.3, -4, -1] as const
const PARTICLES_SCALE = 0.35
const PARTICLES_ROTATION = [0, 0, 0] as const
const PARTICLES_SCROLL_SPEED = 0.5         // how fast it drops on scroll — tune this

function RandomParticles() {
  const { scene } = useGLTF("/models/assets/random-particles.glb")
  const groupRef = useRef<THREE.Group>(null!)
  const groupRef2 = useRef<THREE.Group>(null!)

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#89CFF0"), // #86868675
    emissive: new THREE.Color("#89CFF0"), // #86868675
    emissiveIntensity: 0.4,
    roughness: 0.9,
    metalness: 1,
    transmission: 0.95,
    thickness: 0.8,
    ior: 1.4,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 0.8,
  }), [])

  const mat2 = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#89CFF0"), // #86868675
    emissive: new THREE.Color("#89CFF0"), // #86868675
    emissiveIntensity: 0.35,
    roughness: 0.85,
    metalness: 1,
    transmission: 0.92,
    thickness: 0.75,
    ior: 1.42,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 0.75,
  }), [])

  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      if (!child.isMesh) return
      child.material = mat
      child.renderOrder = 1
      child.castShadow = false
      child.receiveShadow = false
    })
  }, [scene, mat])

  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child: any) => {
      if (!child.isMesh) return
      child.material = mat2
      child.renderOrder = 2
      child.castShadow = false
      child.receiveShadow = false
    })
    return clone
  }, [scene, mat2])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // ── Use shared lerped scroll — smooth, matches Nature ─────────────────
    const s = tickLerpedScroll(0.001)

    const scrollY = PARTICLES_POSITION[1] - s * PARTICLES_SCROLL_SPEED

    if (groupRef.current) {
      groupRef.current.position.x = PARTICLES_POSITION[0] + Math.sin(t * 0.08) * 0.3
      groupRef.current.position.y = scrollY + Math.sin(t * 0.06) * 0.2
      groupRef.current.position.z = PARTICLES_POSITION[2]
      groupRef.current.rotation.y = PARTICLES_ROTATION[1] + Math.sin(t * 0.04) * 0.05
      groupRef.current.rotation.z = PARTICLES_ROTATION[2] + Math.sin(t * 0.05) * 0.02
    }

    if (groupRef2.current) {
      groupRef2.current.position.x = PARTICLES_POSITION[0] + Math.sin(t * 0.09 + 1.2) * 0.28
      groupRef2.current.position.y = scrollY + Math.sin(t * 0.07 + 0.8) * 0.18
      groupRef2.current.position.z = PARTICLES_POSITION[2] - 0.05
      groupRef2.current.rotation.y = PARTICLES_ROTATION[1] + Math.sin(t * 0.045 + 1.5) * 0.045
      groupRef2.current.rotation.z = PARTICLES_ROTATION[2] + Math.sin(t * 0.055 + 0.9) * 0.018
      groupRef2.current.rotation.x = Math.sin(t * 0.03) * 0.02
    }

    mat.emissiveIntensity = 0.3 + Math.sin(t * 0.5) * 0.15
    mat2.emissiveIntensity = 0.28 + Math.sin(t * 0.52 + 0.5) * 0.14
  })

  return (
    <>
      <group ref={groupRef}>
        <primitive object={scene} position={[0, 0, 0]} scale={PARTICLES_SCALE} rotation={PARTICLES_ROTATION} />
      </group>
      <group ref={groupRef2}>
        <primitive object={clonedScene} position={[0, 0, 0]} scale={PARTICLES_SCALE * 0.98} rotation={PARTICLES_ROTATION} />
      </group>
    </>
  )
}

// function Jelly() {
//   const { scene } = useGLTF("/models/assets/jelly.glb")
//   const groupRef = useRef<THREE.Group>(null!)

//   // Animation state
//   const stateRef = useRef({
//     isAnimating: false,
//     progress: 0, // 0 to 1 (bottom to top)
//     targetX: 0,
//     startY: -3,
//     endY: 3,
//   })

//   useLayoutEffect(() => {
//     const jellyMat = new THREE.MeshPhysicalMaterial({
//       color: new THREE.Color("#ff77aa"),
//       roughness: 0.5,
//       metalness: 0.3,
//       transmission: 0.8,
//       thickness: 0.5,
//       ior: 1.3,
//       transparent: true,
//       opacity: 0,
//       depthWrite: false,
//       side: THREE.DoubleSide,
//       envMapIntensity: 1.0,
//     })
//     scene.traverse((child: any) => {
//       if (!child.isMesh) return
//       child.material = jellyMat
//       child.renderOrder = 4
//       child.castShadow = false
//       child.receiveShadow = false
//     })
//   }, [scene])

//   useEffect(() => {
//     // Start animation loop
//     const animateJelly = () => {
//       const state = stateRef.current

//       if (!state.isAnimating) {
//         // Start new animation with random X position
//         state.isAnimating = true
//         state.progress = 0
//         state.targetX = (Math.random() - 0.5) * 8 // Random X between -4 and 4
//         state.startY = -3
//         state.endY = 3
//       }

//       if (state.isAnimating) {
//         // Update progress
//         state.progress += 0.008 // Speed of animation

//         if (state.progress >= 1) {
//           // Animation complete, reset
//           state.isAnimating = false
//           state.progress = 0

//           // Update material opacity to fully transparent
//           if (groupRef.current) {
//             groupRef.current.traverse((child: any) => {
//               if (child.isMesh && child.material) {
//                 child.material.opacity = 0
//               }
//             })
//           }

//           // Schedule next animation after random delay (1-3 seconds)
//           const delay = 1000 + Math.random() * 2000
//           setTimeout(() => {
//             if (!state.isAnimating) {
//               animateJelly()
//             }
//           }, delay)
//           return
//         }

//         // Calculate current Y position (easing for smoother motion)
//         const easeInOut = state.progress < 0.5
//           ? 2 * state.progress * state.progress
//           : 1 - Math.pow(-2 * state.progress + 2, 2) / 2

//         const currentY = state.startY + (state.endY - state.startY) * easeInOut

//         // Calculate opacity (fade in at start, fade out at end)
//         let opacity = 0
//         if (state.progress < 0.2) {
//           // Fade in during first 20%
//           opacity = state.progress / 0.2
//         } else if (state.progress > 0.8) {
//           // Fade out during last 20%
//           opacity = 1 - ((state.progress - 0.8) / 0.2)
//         } else {
//           // Full opacity in middle
//           opacity = 1
//         }

//         // Apply opacity to material
//         if (groupRef.current) {
//           groupRef.current.traverse((child: any) => {
//             if (child.isMesh && child.material) {
//               child.material.opacity = opacity * 0.9
//               // Slight color shift based on progress
//               const hue = 0.95 + easeInOut * 0.1 // Shift from pink to slightly redder
//               child.material.color.setHSL(hue, 1, 0.6)
//             }
//           })
//         }

//         // Update position
//         if (groupRef.current) {
//           groupRef.current.position.x = state.targetX
//           groupRef.current.position.y = currentY
//           groupRef.current.rotation.y = Math.sin(Date.now() * 0.003) * 1
//           groupRef.current.rotation.x = Math.sin(Date.now() * 0.004) * 0.05
//         }
//       }
//     }

//     // Start the first animation after a short delay
//     const timeout = setTimeout(() => {
//       animateJelly()
//     }, 500)

//     // Set up interval for continuous animation checks
//     const interval = setInterval(() => {
//       const state = stateRef.current
//       if (state.isAnimating) {
//         animateJelly()
//       }
//     }, 16) // ~60fps

//     return () => {
//       clearTimeout(timeout)
//       clearInterval(interval)
//     }
//   }, [])

//   return (
//     <group ref={groupRef} position={[0, -3, 0]}>
//       <primitive object={scene} scale={0.001} />
//     </group>
//   )
// }



// ─── Model ────────────────────────────────────────────────────────────────────
function Model(props: any) {
  const { scene } = useGLTF("/models/logo/Convrse_v1.glb")
  const group = useRef<THREE.Group>(null!)
  const introProgress = useRef(0)
  const introDone = useRef(false)
  const targetRotation = useRef(0)

  useLayoutEffect(() => {
    applyMat(scene, LOGO_MAT, 10)
    const box = new THREE.Box3().setFromObject(scene)
    scene.position.sub(box.getCenter(new THREE.Vector3()))
  }, [scene])

  useFrame((_, delta) => {
    if (!group.current) return

    // lerp the global scroll value smoothly
    _lerpedScroll += (_rawScroll - _lerpedScroll) * 0.05

    if (!introDone.current) {
      introProgress.current += delta * 0.4
      const t = Math.min(introProgress.current, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      group.current.rotation.y = THREE.MathUtils.degToRad(160) * (1 - eased)
      group.current.scale.setScalar(100 - (100 - 9.5) * eased)
      if (t >= 1) introDone.current = true
      return
    }

    // ← smooth eased scroll rotation
    // const targetRot = _lerpedScroll * Math.PI * 0.5
    // group.current.rotation.y = THREE.MathUtils.lerp(
    //   group.current.rotation.y,
    //   targetRot,
    //   0.06
    // )
  })


  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  )
}

function Wire() {
  const { scene } = useGLTF("/models/wires.glb")
  const ref = useRef<THREE.Group>(null!)
  const targetRotation = useRef(0)
  const progress = useRef(0)

  useLayoutEffect(() => {
    const wireMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),  // pure white
      metalness: 0.5,
      roughness: 0.06,                        // mirror chrome
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      iridescence: 0.0,                         // OFF — no rainbow
      transmission: 0.0,
      depthWrite: true,
      depthTest: true,
    })
    scene.traverse((child: any) => {
      if (!child.isMesh) return
      child.geometry.computeVertexNormals()
      child.material = wireMat
      child.renderOrder = 5
    })
  }, [scene])   // ← removed env dep — not needed, scene lights drive reflections

  useFrame((_, delta) => {
    if (!ref.current) return

    // lerp scroll
    _lerpedScroll += (_rawScroll - _lerpedScroll) * 0.05

    // intro animation
    progress.current += delta * 0.4
    const eased = THREE.MathUtils.smoothstep(Math.min(progress.current, 1), 0, 1)
    ref.current.position.y = -4.7 + eased * 3
    ref.current.rotation.y = eased * Math.PI * 1.45

    // ← add smooth scroll rotation on top of intro
    const targetRot = eased * Math.PI * 1.45 + _lerpedScroll * Math.PI * 0.5
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      targetRot,
      0.06
    )
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
      <RandomParticles />
      <Nature />
      <FogVolume />
      {/* <Jelly /> */}
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