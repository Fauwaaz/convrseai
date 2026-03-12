"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

export default function Scene1() {

    const { scene } = useGLTF("/models/Scene1.glb")

    const ref = useRef<THREE.Group>(null!)
    const progress = useRef(0)

    useFrame((_, delta) => {

        if (!ref.current) return

        progress.current += delta * 0.4
        const p = Math.min(progress.current, 1)

        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic

        // rise from bottom
        ref.current.position.y = -8 + eased * 6

        // rotate while rising
        ref.current.rotation.y = eased * Math.PI * 1.6

    })

    return (
        <>
            <primitive
                ref={ref}
                object={scene}
                scale={1}
                position={[0, -6, 0]}
            />
        </>
    )
}