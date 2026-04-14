"use client"

import { useGLTF, useEnvironment } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from "react"
import * as THREE from "three"


// ─── Meteor config ────────────────────────────────────────────────────────────
const METEOR_COUNT   = 6
const METEOR_INTERVAL = [3, 8]   // random delay between spawns (seconds)

// ─── Single meteor — trail + glow point ──────────────────────────────────────
const TRAIL_MAT = new THREE.ShaderMaterial({
  uniforms: { uProgress: { value: 0 }, uColor: { value: new THREE.Color("#aaddff") } },
  vertexShader: `
    attribute float aT;        // 0 at tail, 1 at head
    varying   float vT;
    void main() {
      vT          = aT;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform vec3  uColor;
    varying float vT;
    void main() {
      // Only draw the visible part of the trail
      float show  = step(1.0 - uProgress, vT);           // head leads
      float alpha = show * vT * vT * 0.9;                // bright at head, fade at tail
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  transparent: true,
  depthWrite:  false,
  blending:    THREE.AdditiveBlending,
  side:        THREE.DoubleSide,
})

function Meteor({ delay }: { delay: number }) {
  const trailRef  = useRef<THREE.Line<THREE.BufferGeometry, THREE.Material>>(null!)
  const glowRef   = useRef<THREE.Mesh>(null!)
  const matRef    = useRef(TRAIL_MAT.clone())

  // Randomised per-meteor — computed once
  const config = useMemo(() => ({
    startX:    -12 - Math.random() * 5,          // spawn off left edge
    startY:     4  + Math.random() * 4,           // high up
    startZ:    -2  - Math.random() * 3,
    dx:         18 + Math.random() * 6,           // travel right
    dy:        -5  - Math.random() * 3,           // travel down
    length:     2  + Math.random() * 2,           // trail length
    speed:      0.6 + Math.random() * 0.5,        // duration seconds
    color:      new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.6, 0.85),
  }), [])

  // Build trail geometry — a line from tail (0) to head (1)
  const geo = useMemo(() => {
    const SEGMENTS = 30
    const positions = new Float32Array((SEGMENTS + 1) * 3)
    const aT        = new Float32Array(SEGMENTS + 1)
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS
      aT[i]              = t
      positions[i * 3]   = config.startX + (config.dx - config.length) * t   // tail→head
      positions[i * 3+1] = config.startY + config.dy * t
      positions[i * 3+2] = config.startZ
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setAttribute("aT",       new THREE.BufferAttribute(aT, 1))
    return g
  }, [config])

  // Animation state
  const state = useRef({ phase: "waiting", t: 0, nextFire: delay })

  useFrame((_, delta) => {
    const s = state.current

    if (s.phase === "waiting") {
      s.t += delta
      if (s.t >= s.nextFire) {
        s.phase    = "flying"
        s.t        = 0
      }
      if (trailRef.current)  trailRef.current.visible  = false
      if (glowRef.current)   glowRef.current.visible   = false
      return
    }

    if (s.phase === "flying") {
      s.t += delta
      const progress = Math.min(s.t / config.speed, 1)

      if (trailRef.current)  trailRef.current.visible  = true
      if (glowRef.current)   glowRef.current.visible   = true

      // Slide the whole trail group forward
      const travel = progress
      if (trailRef.current) {
        trailRef.current.position.x = config.dx * travel
        trailRef.current.position.y = config.dy * travel
      }
      if (glowRef.current) {
        glowRef.current.position.x = config.startX + config.dx * travel + config.dx * 0.03
        glowRef.current.position.y = config.startY + config.dy * travel
        glowRef.current.position.z = config.startZ
      }

      matRef.current.uniforms.uProgress.value = progress

      // Fade out glow near end
      const glowMat = glowRef.current?.material as THREE.MeshBasicMaterial
      if (glowMat) glowMat.opacity = (1 - progress) * 0.8

      if (progress >= 1) {
        // Reset — random next interval
        s.phase    = "waiting"
        s.t        = 0
        s.nextFire = METEOR_INTERVAL[0] + Math.random() * (METEOR_INTERVAL[1] - METEOR_INTERVAL[0])
        if (trailRef.current)  trailRef.current.visible = false
        if (glowRef.current)   glowRef.current.visible  = false
      }
    }
  })

  return (
    <>
      {/* Trail line */}
      <lineSegments ref={trailRef} geometry={geo} visible={false}>
        <primitive object={matRef.current} attach="material" />
      </lineSegments>

      {/* Head glow — bright point at the front */}
      <mesh ref={glowRef} visible={false} renderOrder={10}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function Meteors() {
  const delays = useMemo(
    () => Array.from({ length: METEOR_COUNT }, (_, i) =>
      i * (METEOR_INTERVAL[1] / METEOR_COUNT) + Math.random() * 2
    ),
    []
  )

  return (
    <>
      {delays.map((delay, i) => <Meteor key={i} delay={delay} />)}
    </>
  )
}

export default Meteors