import React, { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function CometSegment({ path, velocity }) {

  const meshRef = useRef()
  const life = useRef(1)

  const texture = useMemo(() => createTailTexture(), [])

  const curve = useMemo(() => new THREE.CatmullRomCurve3(path), [path])

  useFrame((_, delta) => {

    life.current -= delta * 0.8

    if (meshRef.current) {

      meshRef.current.position.add(
        velocity.clone().multiplyScalar(delta * 2)
      )

      meshRef.current.material.opacity = life.current

    }

  })

  if (life.current <= 0) return null

  return (
    <mesh ref={meshRef}>
      {/* length segments increased for smoother fade */}
      <tubeGeometry args={[curve, 40, 0.04, 6, false]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function createTailTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 1

  const ctx = canvas.getContext("2d")

  const gradient = ctx.createLinearGradient(0, 0, 256, 0)
  gradient.addColorStop(0, "rgba(255,255,255,0)")
  gradient.addColorStop(0.6, "rgba(255,255,255,0.4)")
  gradient.addColorStop(1, "rgba(255,255,255,1)")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 1)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  return texture
}

export function MouseOverlay() {
  const { viewport, mouse } = useThree()

  const [segments, setSegments] = useState([])
  const lastPos = useRef(new THREE.Vector3())

  useFrame((state, delta) => {

    const x = (mouse.x * viewport.width) / 2
    const y = (mouse.y * viewport.height) / 2

    const current = new THREE.Vector3(x, y, 0)

    const velocity = current.clone().sub(lastPos.current)

    const speed = velocity.length()

    if (speed > 0.02) {

      const spread = velocity.clone().multiplyScalar(-0.5)

      const path = []

      for (let i = 0; i < 6; i++) {

        const offset = spread.clone().multiplyScalar(i * 0.25)

        path.push(current.clone().add(offset))

      }

      setSegments(prev => [
        ...prev.slice(-40),
        {
          id: Math.random(),
          path,
          velocity: spread
        }
      ])

      lastPos.current.copy(current)
    }

  })

  return (
    <group>
      {segments.map(seg => (
        <CometSegment key={seg.id} {...seg} />
      ))}
    </group>
  )
}