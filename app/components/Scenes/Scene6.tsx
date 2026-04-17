// "use client"

// import { OrbitControls, useGLTF } from "@react-three/drei"
// import { Canvas, useFrame } from "@react-three/fiber"
// import { useLayoutEffect, useRef, useMemo } from "react"
// import * as THREE from "three"
// import { EffectComposer, Bloom } from "@react-three/postprocessing"

// // ─── Tune ALL positions/scales/rotations here ─────────────────────────────────
// const CAMERA = { pos: [0, 0, 5] as const, fov: 50 }

// const SCENE_OFFSET = [0, 0, 0] as const   // moves the whole scene

// const CONTAINER = { pos: [-1.1, -2.5, -6.5] as const, scale: 1, rot: [0, 0, 0] as const }
// const PILLARS = { pos: [-3, -5, -10] as const, scale: 1, rot: [0, 0.05, 0] as const }
// const WATER = { pos: [0, -1.5, 0] as const, scale: 1.5, rot: [0, 0, 0] as const }
// const LOGO_CFG = { pos: [0, 0, 0] as const, scale: 1, rot: [0, 0, 0] as const, spinSpeed: 0.8, floatAmp: 0.06 }
// const LIGHTS_CFG = { pos: [-1, 9, -2] as const, scale: 1, rot: [0, 0, 0] as const }

// // ─── Materials ────────────────────────────────────────────────────────────────
// const METAL_MAT = new THREE.MeshPhysicalMaterial({
//   color: new THREE.Color("#1a1f2a"), metalness: 1.0, roughness: 0.35,
//   clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 1.5,
// })
// const PILLAR_MAT = new THREE.MeshPhysicalMaterial({
//   color: new THREE.Color("#0d1015"), metalness: 0.6, roughness: 0.7, envMapIntensity: 0.8,
// })
// const WATER_MAT = new THREE.MeshPhysicalMaterial({
//   color: new THREE.Color("#001520"), metalness: 0.0, roughness: 0.0,
//   transmission: 0.9, thickness: 0.5, ior: 1.33,
//   transparent: true, opacity: 0.85, envMapIntensity: 2.0,
//   side: THREE.DoubleSide, depthWrite: false,
// })
// const LOGO_MAT = new THREE.MeshPhysicalMaterial({
//   color: new THREE.Color("#aaccff"), metalness: 0.0, roughness: 0.0,
//   transmission: 0.92, thickness: 1.5, ior: 1.5,
//   transparent: true, opacity: 0.9, envMapIntensity: 3.0,
//   iridescence: 1.0, iridescenceIOR: 1.8,
//   iridescenceThicknessRange: [100, 600] as [number, number],
//   clearcoat: 1.0, clearcoatRoughness: 0.0,
//   depthWrite: false, side: THREE.DoubleSide,
// })

// const LAND_MAT = new THREE.MeshStandardMaterial({
//   color: new THREE.Color("#102030"), roughness: 0.9, metalness: 0.2,
// })

// function applyMat(obj: THREE.Object3D, mat: THREE.Material) {
//   obj.traverse((child: any) => {
//     if (!child.isMesh) return
//     child.material = mat; child.castShadow = true; child.receiveShadow = true
//   })
// }

// // ─── Parts ────────────────────────────────────────────────────────────────────
// function Container() {
//   const { scene } = useGLTF("/models/assets/container.glb")
//   useLayoutEffect(() => {
//     applyMat(scene, METAL_MAT)
//     // NO scene.position.sub — constants control position
//   }, [scene])
//   return (
//     <primitive
//       object={scene}
//       position={CONTAINER.pos}
//       scale={CONTAINER.scale}
//       rotation={CONTAINER.rot}
//     />
//   )
// }

// function Pillars() {
//   const { scene } = useGLTF("/models/assets/pillars.glb")
//   useLayoutEffect(() => { applyMat(scene, PILLAR_MAT) }, [scene])
//   return (
//     <primitive
//       object={scene}
//       position={PILLARS.pos}
//       scale={PILLARS.scale}
//       rotation={PILLARS.rot}
//     />
//   )
// }

// function Water() {
//   const { scene } = useGLTF("/models/assets/river.glb")
//   const ref = useRef<THREE.Group>(null!)
//   const waterMat = useMemo(() => WATER_MAT.clone(), [])

//   useLayoutEffect(() => { applyMat(scene, waterMat) }, [scene, waterMat])

//   useFrame(({ clock }) => {
//     const t = clock.getElapsedTime()
//     waterMat.envMapIntensity = 1.8 + Math.sin(t * 0.8) * 0.4
//     if (ref.current)
//       ref.current.position.y = WATER.pos[1] + Math.sin(t * 0.6) * 0.015
//   })

//   return (
//     <group ref={ref}>
//       <primitive
//         object={scene}
//         position={WATER.pos}
//         scale={WATER.scale}
//         rotation={WATER.rot}
//       />
//     </group>
//   )
// }

// function Logo() {
//   const { scene } = useGLTF("/models/assets/logo.glb")
//   const ref = useRef<THREE.Group>(null!)

//   useLayoutEffect(() => {
//     applyMat(scene, LOGO_MAT)

//     // 🔥 CENTER PIVOT (THIS IS WHAT YOU'RE MISSING)
//     const box = new THREE.Box3().setFromObject(scene)
//     const center = box.getCenter(new THREE.Vector3())

//     scene.position.sub(center) // shifts geometry so pivot = center
//   }, [scene])

//   useFrame(({ clock }) => {
//     const t = clock.getElapsedTime()
//     if (!ref.current) return
//     ref.current.rotation.y = LOGO_CFG.rot[1] + t * LOGO_CFG.spinSpeed
//     ref.current.position.y = LOGO_CFG.pos[1] + Math.sin(t * 0.5) * LOGO_CFG.floatAmp
//   })

//   return (
//     <group ref={ref} position={LOGO_CFG.pos}>
//       <primitive object={scene} scale={LOGO_CFG.scale} />
//     </group>
//   )
// }

// function Land() {
//   const { scene } = useGLTF("/models/assets/land.glb")
//   useLayoutEffect(() => {
//     applyMat(scene, LAND_MAT)
//     // NO scene.position.sub — constants control position
//   }, [scene])
//   return <primitive object={scene} />
// }

// function LightStrips() {
//   const { scene } = useGLTF("/models/assets/lights.gltf")
//   const ref = useRef<THREE.Group>(null!)

//   useLayoutEffect(() => {
//     scene.traverse((child: any) => {
//       if (!child.isMesh) return
//       child.material = new THREE.MeshStandardMaterial({
//         color: new THREE.Color("#001a2e"), emissive: new THREE.Color("#00c8ff"),
//         emissiveIntensity: 2.0, roughness: 0.2, metalness: 0.8,
//       })
//     })
//   }, [scene])

//   useFrame(({ clock }) => {
//     const t = clock.getElapsedTime()
//     if (!ref.current) return
//     ref.current.traverse((child: any) => {
//       if (child.isMesh && child.material?.emissiveIntensity !== undefined)
//         child.material.emissiveIntensity = 1.6 + Math.sin(t * 1.4) * 0.6
//     })
//   })

//   return (
//     <group ref={ref}>
//       <primitive
//         object={scene}
//         position={LIGHTS_CFG.pos}
//         scale={LIGHTS_CFG.scale}
//         rotation={LIGHTS_CFG.rot}
//       />
//     </group>
//   )
// }

// // ─── Lights ───────────────────────────────────────────────────────────────────
// function SceneLights() {
//   const cyanTop = useRef<THREE.PointLight>(null!)
//   const cyanFill = useRef<THREE.PointLight>(null!)

//   useFrame(({ clock }) => {
//     const t = clock.getElapsedTime()
//     if (cyanTop.current) cyanTop.current.intensity = 5 + Math.sin(t * 1.4) * 1.5
//     if (cyanFill.current) cyanFill.current.intensity = 2 + Math.sin(t * 1.4 + 0.5) * 0.8
//   })

//   return (
//     <>
//       <ambientLight intensity={0.015} color="#020810" />
//       <pointLight ref={cyanTop} position={[0, 1.5, 0]} intensity={5} color="#00d4ff" distance={10} decay={2} />
//       <pointLight ref={cyanFill} position={[0, -0.5, 0.5]} intensity={2} color="#0088cc" distance={6} decay={2} />
//       <pointLight position={[0, -2.5, 0]} intensity={3} color="#006688" distance={8} decay={1.5} />
//       <pointLight position={[-6, 1, -4]} intensity={1.2} color="#102030" distance={14} decay={1.5} />
//       <pointLight position={[6, 1, -4]} intensity={1.2} color="#102030" distance={14} decay={1.5} />
//       <directionalLight position={[0, 8, 2]} intensity={0.5} color="#aaddff" />
//       <directionalLight position={[0, 2, -10]} intensity={0.4} color="#2244aa" />
//     </>
//   )
// }

// // ─── Export ───────────────────────────────────────────────────────────────────
// export default function Scene4() {
//   return (
//     <section
//       style={{
//         position: "relative", width: "100%", height: "100vh",
//         overflow: "hidden", backgroundColor: "#000000",
//       }}
//     >
//       <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
//         <Canvas
//           camera={{ position: CAMERA.pos, fov: CAMERA.fov }}
//           gl={{ alpha: false, antialias: false, powerPreference: "high-performance" }}
//           shadows
//           style={{ background: "#020810" }}
//           onCreated={({ gl }) => {
//             gl.setClearColor(0x020810, 1)
//             gl.shadowMap.enabled = true
//             gl.shadowMap.type = THREE.PCFSoftShadowMap
//           }}
//         >
//           <SceneLights />
//           <fogExp2 attach="fog" args={["#020810", 0.055]} />

//           <group position={SCENE_OFFSET}>
//             <Pillars />
//             <Container />
//             <Water />
//             {/* <Land /> */}
//             <Logo />
//             <LightStrips />
//           </group>

//           <EffectComposer>
//             <Bloom intensity={0.01} luminanceThreshold={0.12} luminanceSmoothing={0.85} mipmapBlur />
//           </EffectComposer>

//           <OrbitControls
//             enableZoom={true}
//             enablePan={false}
//             minPolarAngle={Math.PI / 5}
//             maxPolarAngle={Math.PI / 0}
//           />

//         </Canvas>
//       </div>
//     </section>
//   )
// }



"use client"

import { OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef, useMemo } from "react"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

// ─── Tune ALL positions here ──────────────────────────────────────────────────
const CAMERA = { pos: [0, 0, 5] as const, fov: 32 }

const MODEL_POS = [-1, 12.5, -8] as const   // x=left/right, y=up/down, z=front/back
const MODEL_SCALE = 1.0
const MODEL_ROT = [-0.03, 0, 0] as const   // radians

const GLOWSCREEN_POS = [0, 0.55, 0.52] as const
const FOG_DENSITY = 0.03

// Scroll — model drops from START_Y to START_Y - SCROLL_DROP over 1 viewport
const SCROLL_START_Y = 2
const SCROLL_DROP = 3.2

// ─── Scroll ───────────────────────────────────────────────────────────────────
let _s4scroll = 0, _s4dirty = true
if (typeof window !== "undefined")
  window.addEventListener("scroll", () => { _s4dirty = true }, { passive: true })
function getS4Scroll() {
  if (_s4dirty) { _s4scroll = window.scrollY / window.innerHeight; _s4dirty = false }
  return _s4scroll
}

// ─── Volume fog ───────────────────────────────────────────────────────────────
function VolumeFog() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
    `,
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
      }
      void main(){
        vec2 uv=vUv+vec2(uTime*0.01,uTime*0.005);
        float n=noise(uv*4.)*0.5+noise(uv*8.)*0.25+noise(uv*16.)*0.125;
        float ey=(1.-smoothstep(0.,.25,vUv.y))*(1.-smoothstep(.75,1.,vUv.y));
        float ex=(1.-smoothstep(0.,.1,vUv.x))*(1.-smoothstep(.9,1.,vUv.x));
        gl_FragColor=vec4(0.05,0.15,0.22,n*ey*ex*0.28);
      }
    `,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }) => { mat.uniforms.uTime.value = clock.getElapsedTime() })

  return (
    <>
      <mesh position={[0, -2.8, 1]} rotation={[-0.08, 0, 0]} renderOrder={4}><planeGeometry args={[18, 5]} /><primitive object={mat} attach="material" /></mesh>
      <mesh position={[0, -3.5, -1]} rotation={[-0.04, 0.1, 0]} renderOrder={4}><planeGeometry args={[22, 4]} /><primitive object={mat} attach="material" /></mesh>
      <mesh position={[0, -2.0, -3]} rotation={[0.06, -0.1, 0]} renderOrder={4}><planeGeometry args={[20, 6]} /><primitive object={mat} attach="material" /></mesh>
    </>
  )
}

// ─── Fix logo config — bring into camera view ─────────────────────────────────
const LOGO_CFG = {
  pos:       [0.2, 0, -4] as const,   // ← was [0,10,0] — way above camera
  scale:     1,
  rot:       [0, 0, 0] as const,
  spinSpeed: 0.8,                  // ← was 0.8 — too fast
  floatAmp:  0.06,
}

// ─── Materials ────────────────────────────────────────────────────────────────
const LOGO_MAT = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#aaccff"), metalness: 0.0, roughness: 0.0,
  transmission: 0.92, thickness: 1.5, ior: 1.5,
  transparent: true, opacity: 0.5, envMapIntensity: 3.0,
  iridescence: 1.0, iridescenceIOR: 1.8,
  iridescenceThicknessRange: [100, 600] as [number, number],
  clearcoat: 1.0, clearcoatRoughness: 0.0,
  depthWrite: false, side: THREE.DoubleSide,
})


function applyMat(obj: THREE.Object3D, mat: THREE.Material) {
  obj.traverse((child: any) => {
    if (!child.isMesh) return
    child.material = mat; child.castShadow = true; child.receiveShadow = true
  })
}

function Logo() {
  const { scene } = useGLTF("/models/assets/logo.glb")
  const ref = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    applyMat(scene, LOGO_MAT)

    // 🔥 CENTER PIVOT (THIS IS WHAT YOU'RE MISSING)
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())

    scene.position.sub(center) // shifts geometry so pivot = center
  }, [scene])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!ref.current) return
    ref.current.rotation.y = LOGO_CFG.rot[1] + t * LOGO_CFG.spinSpeed
    ref.current.position.y = LOGO_CFG.pos[1] + Math.sin(t * 0.5) * LOGO_CFG.floatAmp
  })

  return (
    <group ref={ref} position={LOGO_CFG.pos}>
      <primitive object={scene} scale={LOGO_CFG.scale} />
    </group>
  )
}

// ─── Model ────────────────────────────────────────────────────────────────────
function  Scene6Model() {
  const { scene } = useGLTF("/models/assets/scene4-all-copy.glb")
  const groupRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    scene.traverse((child: any) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true

      const existing = child.material as THREE.MeshStandardMaterial

      child.material = new THREE.MeshPhysicalMaterial({
        map: existing.map || null,
        normalMap: existing.normalMap || null,
        roughnessMap: existing.roughnessMap || null,
        metalnessMap: existing.metalnessMap || null,
        aoMap: existing.aoMap || null,

        color: existing.color
          ? existing.color.clone().multiplyScalar(0.5).offsetHSL(0, 0, -0.05)
          : new THREE.Color("#0d1520"),

        metalness: existing.metalness ?? 0.5,
        roughness: existing.roughness ?? 1.0,

        envMapIntensity: 0.2,
        clearcoat: 0.2,
        clearcoatRoughness: 0.4,
      })
    })
    // NO scene.position.sub
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const s = getS4Scroll()
    groupRef.current.position.y = MODEL_POS[1] + SCROLL_START_Y - s * SCROLL_DROP
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} position={MODEL_POS} scale={MODEL_SCALE} rotation={MODEL_ROT} />
    </group>
  )
}

// ─── Lights ───────────────────────────────────────────────────────────────────
function Scene6Lights() {
  const logoGlowRef = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (logoGlowRef.current)
      logoGlowRef.current.intensity = 1.2 + Math.sin(t * 0.8) * 0.2
  })

  return (
    <>
      <pointLight
        position={[0, 0.5, 1.2]}
        intensity={0.8}
        color="#ffffff"
        distance={3}     // 🔥 tighter
        decay={3}
      />

      <pointLight
        position={[0, -0.5, 0.5]}
        intensity={0.6}
        color="#0d4455"
        distance={2.5}   // 🔥 tighter
        decay={3}
      />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function Scene6() {
  const coreLight = useRef<THREE.SpotLight>(null!)

  return (
    <section style={{ position: "relative", width: "100%", height: "120vh", overflow: "hidden", backgroundColor: "#000000" }}>
      <Canvas
        camera={{ position: CAMERA.pos, fov: CAMERA.fov }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          // ─── Exposure control ─────────────────────────────────────────
          toneMapping: THREE.ACESFilmicToneMapping,  // cinematic — doesn't blow out
          toneMappingExposure: 0.005,
        }}
        shadows
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          // ── Also set directly on renderer in case gl prop doesn't apply ──
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.005   // ← same value here
        }}
      >
        <Scene6Lights />
        <fogExp2 attach="fog" args={["#040d16", FOG_DENSITY]} />
        <Scene6Model />
        <VolumeFog />

        <Logo />    


        {/* <EffectComposer>
          <Bloom
            intensity={0.001}
            luminanceThreshold={0.6}  // 🔥 key fix
            luminanceSmoothing={0.9}
          />
        </EffectComposer> */}

        {/* <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 0}
        /> */}
      </Canvas>
    </section>
  )
}