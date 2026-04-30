"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useRef, useLayoutEffect } from "react"
import * as THREE from "three"
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing"

/* ───────────────── CONFIG (TUNE EVERYTHING HERE) ───────────────── */

const CAMERA = { pos: [0, 0, 6] as const, fov: 45 }

const LAND = {
    pos: [-0.3, -3.5, 0] as const,
    scale: 0.5,
    rot: [0, 0, 0] as const,
    floatAmp: 0.08,
}

const ROCK = {
    pos: [0, 0, 0] as const,
    scale: 0.8,
    rot: [0, 0, 0] as const,
    spinSpeed: 0.15, // smooth rotation
}

const MAP = {
    pos: [-2, 0.3, -2] as const,
    scale: 0.70,
    rot: [0, 0.4, 0] as const,
}

const LIGHTS = {
    pos: [0, 2, 1] as const,
    scale: 1,
    rot: [0, 0, 0] as const,
}

/* ───────────────── HELPERS ───────────────── */

function centerPivot(scene: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    scene.position.sub(center)
}

/* ───────────────── MODELS ───────────────── */

function Land() {
    const { scene } = useGLTF("/models/assets/scene7/land.glb")
    const ref = useRef<THREE.Group>(null!)

    useLayoutEffect(() => {
        centerPivot(scene)
    }, [scene])

    useFrame(({ clock }, delta) => {
        const t = clock.getElapsedTime()
        if (!ref.current) return

        // ✅ subtle floating
        ref.current.position.y =
            LAND.pos[1] + Math.sin(t * 0.6) * LAND.floatAmp

        // ✅ smooth rotation in place (Y axis)
        // ref.current.rotation.y += delta * 0.15
    })

    return (
        <group ref={ref} position={LAND.pos}>
            <primitive object={scene} scale={LAND.scale} rotation={LAND.rot} />
        </group>
    )
}

function Rock() {
    const { scene } = useGLTF("/models/assets/scene7/rocks.glb")
    const ref = useRef<THREE.Group>(null!)

    useLayoutEffect(() => {
        centerPivot(scene)
    }, [scene])

    useFrame((_, delta) => {
        if (!ref.current) return

        // 🔥 smooth rotation (no jitter)
        ref.current.rotation.y += delta * ROCK.spinSpeed
    })

    return (
        <group ref={ref} position={ROCK.pos}>
            <primitive object={scene} scale={ROCK.scale} rotation={ROCK.rot} />
        </group>
    )
}

function MapModel() {
    const { scene } = useGLTF("/models/assets/scene7/map.glb")

    useLayoutEffect(() => {
        centerPivot(scene)
    }, [scene])

    return (
        <primitive
            object={scene}
            position={MAP.pos}
            scale={MAP.scale}
            rotation={MAP.rot}
        />
    )
}

function LightsModel() {
    const { scene } = useGLTF("/models/assets/scene7/lights.glb")
    const ref = useRef<THREE.Group>(null!)

    useLayoutEffect(() => {
        scene.traverse((child: any) => {
            if (!child.isMesh) return

            child.material = new THREE.MeshStandardMaterial({
                color: "#001a2e",
                emissive: "#00c8ff",
                emissiveIntensity: 1.5,
                metalness: 0.8,
                roughness: 0.3,
            })
        })
    }, [scene])

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()

        ref.current?.traverse((child: any) => {
            if (child.isMesh && child.material?.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity =
                    1.2 + Math.sin(t * 1.2) * 0.4
            }
        })
    })

    return (
        <group ref={ref}>
            <primitive
                object={scene}
                position={LIGHTS.pos}
                scale={LIGHTS.scale}
                rotation={LIGHTS.rot}
            />
        </group>
    )
}

/* ───────────────── LIGHTS ───────────────── */

function SceneLights() {
    const core = useRef<THREE.PointLight>(null!)
    const halo = useRef<THREE.PointLight>(null!)
    const rimL = useRef<THREE.PointLight>(null!)
    const rimR = useRef<THREE.PointLight>(null!)

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()

        // 🔥 subtle breathing (DO NOT overdo this)
        if (core.current)
            core.current.intensity = 3 + Math.sin(t * 1.2) * 0.4

        if (halo.current)
            halo.current.intensity = 1.8 + Math.sin(t * 0.8) * 0.3
    })

    return (
        <>
            {/* BASE AMBIENT (keep low or everything washes out) */}
            <ambientLight intensity={0.04} />

            {/* 🔥 MAIN CORE LIGHT (this is your focus) */}
            <pointLight
                ref={core}
                position={[1, -0.5, 1.5]}
                intensity={10}
                color="#ffffff"
                distance={4}
                decay={2}
            />

            {/* 🔥 HALO FILL (soft glow around center) */}
            <pointLight
                ref={halo}
                position={[0, 0.5, 1]}
                intensity={1.8}
                color="#88ccff"
                distance={6}
                decay={2}
            />

            {/* 🔥 GROUND BOUNCE */}
            <pointLight
                position={[0, -2.5, 0]}
                intensity={10.5}
                color="#004466"
                distance={6}
                decay={2}
            />

            {/* 🔥 SIDE RIMS (depth separation) */}
            <pointLight
                ref={rimL}
                position={[-3, 1, 0]}
                intensity={1}
                color="#113355"
                distance={8}
                decay={2}
            />

            <pointLight
                ref={rimR}
                position={[3, 1, 0]}
                intensity={10}
                color="#113355"
                distance={8}
                decay={2}
            />

            {/* 🔥 TOP LIGHT (subtle highlight, NOT spotlight-level) */}
            <pointLight
                position={[0, 3, 2]}
                intensity={10.2}
                color="#aaddff"
                distance={8}
                decay={2}
            />

            {/* 🔥 BACK SEPARATION */}
            <pointLight
                position={[0, 1, -4]}
                intensity={10.8}
                color="#0a1a2a"
                distance={10}
                decay={2}
            />

            <pointLight
                position={[0, -5, -1]}
                intensity={10}
                color="#fff"
                distance={10}
                decay={2}
            />

            <pointLight
                position={[-0.5, 0, -1]}
                intensity={50}
                color="#87CEEB"
                distance={50}
                decay={2}
            />
        </>
    )
}

function CausticsLayer() {
    const ref = useRef<THREE.Mesh>(null!)
    const matRef = useRef<THREE.ShaderMaterial>(null!)

    useFrame(({ clock }) => {
        if (!matRef.current) return
        matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    })

    return (
        <mesh ref={ref} position={[0, 2.5, -1]} rotation={[4.8, Math.PI, 0]}>
            <planeGeometry args={[22, 5, 32, 32]} />
            <shaderMaterial
                ref={matRef}
                uniforms={{
                    uTime: { value: 0 },
                }}
                vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;

          void main() {
            vUv = uv;

            vec3 pos = position;

            // multi-layered wave displacement
            float wave1 = sin(pos.x * 2.5 + uTime * 0.8) * 0.08;
            float wave2 = sin(pos.y * 3.0 + uTime * 1.1) * 0.06;
            float wave3 = sin((pos.x + pos.y) * 2.0 + uTime * 0.6) * 0.05;

            pos.z += wave1 + wave2 + wave3;
            vWave = wave1 + wave2 + wave3;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
                fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;

          void main() {
            vec2 uv = vUv;

            // caustic pattern — layered sine grids
            float c1 = sin(uv.x * 18.0 + uTime * 0.5) * sin(uv.y * 14.0 + uTime * 0.4);
            float c2 = sin(uv.x * 12.0 - uTime * 0.3) * sin(uv.y * 20.0 + uTime * 0.6);
            float c3 = sin((uv.x + uv.y) * 16.0 + uTime * 0.7);

            float caustic = (c1 + c2 + c3) * 0.33;
            caustic = pow(max(caustic, 0.0), 1.8);  // sharpen bright spots

            // diamond/net pattern
            float net = abs(sin(uv.x * 10.0 + uTime * 0.2)) * abs(sin(uv.y * 8.0 + uTime * 0.15));
            net = pow(net, 3.0) * 0.6;

            float combined = caustic * 0.7 + net * 0.5 + vWave * 1.2;

            // colour: dark teal → bright white-blue
            vec3 deep   = vec3(0.02, 0.08, 0.14);
            vec3 bright = vec3(0.65, 0.88, 1.00);
            vec3 col = mix(deep, bright, combined);

            // fade to black at bottom edge — creates the transition
            float fadeBottom = smoothstep(0.0, 0.45, vUv.y);
            // fade to black at top edge
            float fadeTop    = smoothstep(1.0, 0.75, vUv.y);

            float alpha = combined * fadeBottom * fadeTop * 0.82;

            gl_FragColor = vec4(col, alpha);
          }
        `}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

/* ───────────────── EXPORT ───────────────── */


export default function Scene7() {
    return (
        <section
            style={{
                width: "100%",
                height: "100vh",
                background: "#020810",
                overflow: "hidden",
            }}
        >
            <Canvas
                camera={{ position: CAMERA.pos, fov: CAMERA.fov }}
                shadows
            >
                <fogExp2 attach="fog" args={["#020810", 0.05]} />

                <SceneLights />

                <CausticsLayer />

                <EffectComposer>
                    <Bloom
                        intensity={0.3}
                        kernelSize={3}
                    />
                </EffectComposer>

                {/* <OrbitControls
                    enableZoom={true} // Disable zoom on mobile for better performance
                    enablePan={false}
                    minPolarAngle={Math.PI / 10}
                    maxPolarAngle={Math.PI / 0}
                    makeDefault
                /> */}

                <Land />
                <Rock />
                <MapModel />
                <LightsModel />
            </Canvas>
        </section>
    )
}