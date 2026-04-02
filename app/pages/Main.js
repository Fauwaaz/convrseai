"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useVideoTexture } from "@react-three/drei";
import Model from "../components/Model";
import Wire from "../components/Wire";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

import Scene1 from "../components/Scenes/Scene1";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Scene2 from "../components/Scenes/Scene2";
import Nature from "../components/Scenes/assets/Nature";
import Scene3 from "../components/Scenes/Scene3";
import Scene4 from "../components/Scenes/Scene4";

function ScrollController({ children }) {
  const group = useRef()

  useFrame(() => {
    const scroll = window.scrollY / window.innerHeight

    if (group.current) {
      group.current.rotation.y = scroll * Math.PI * 0.5
    }
  })

  return <group ref={group}>{children}</group>
}

// ─── Tune these ───────────────────────────────────────────────────────────────
const LIGHT_CONFIG = {
  interval:    10,      // seconds between each pulse
  duration:    5,    // seconds the pulse takes (rise + fall)
  lights: [
    { low: 5,  high: 80  },   // center core green
    { low: 1,   high: 6   },   // center white
    { low: 6,   high: 22  },   // ground pool yellow-green
    { low: 3,   high: 14  },   // ground pool 2
    { low: 0.5, high: 4   },   // tree fill left
    { low: 0.5, high: 4   },   // tree fill right
    { low: 8,   high: 30  },   // gold ground
    { low: 4,   high: 18  },   // teal center
  ]
}

function SceneLights() {
  const coreGreen  = useRef(null)
  const coreWhite  = useRef(null)
  const groundYG   = useRef(null)
  const groundYG2  = useRef(null)
  const treeFillL  = useRef(null)
  const treeFillR  = useRef(null)
  const goldGround = useRef(null)
  const tealCenter = useRef(null)

  const refs = [
    coreGreen, coreWhite, groundYG, groundYG2,
    treeFillL, treeFillR, goldGround, tealCenter
  ]

  const lastFired = useRef(0)
  const pulsing   = useRef(false)
  const pulseT    = useRef(0)

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    const cfg     = LIGHT_CONFIG

    if (!pulsing.current && elapsed - lastFired.current >= cfg.interval) {
      pulsing.current = true
      pulseT.current  = 0
      lastFired.current = elapsed
    }

    if (pulsing.current) {
      pulseT.current += 1 / 60

      const t        = Math.min(pulseT.current / cfg.duration, 1)
      const bell     = Math.sin(t * Math.PI)

      refs.forEach((ref, i) => {
        if (!ref.current) return
        const { low, high } = cfg.lights[i]
        ref.current.intensity = low + (high - low) * bell
      })

      if (t >= 1) {
        pulsing.current = false
        refs.forEach((ref, i) => {
          if (ref.current) ref.current.intensity = cfg.lights[i].low
        })
      }
    }
  })

  return (
    <>
      <pointLight ref={coreGreen}  position={[0,  -2,  0]} intensity={LIGHT_CONFIG.lights[0].low} color="#ccffdd" distance={10} decay={2}   />
      <pointLight ref={coreWhite}  position={[0,   0,  0]} intensity={LIGHT_CONFIG.lights[1].low} color="#ffffff"  distance={5}  decay={2.5} />
      <pointLight ref={groundYG}   position={[0,  -3,  0]} intensity={LIGHT_CONFIG.lights[2].low} color="#aaff00"  distance={12} decay={1.5} />
      <pointLight ref={groundYG2}  position={[0,  -5, -1]} intensity={LIGHT_CONFIG.lights[3].low} color="#88cc00"  distance={18} decay={1.2} />
      <pointLight ref={treeFillL}  position={[-5, -1, -2]} intensity={LIGHT_CONFIG.lights[4].low} color="#224400"  distance={12} decay={2}   />
      <pointLight ref={treeFillR}  position={[5,  -1, -2]} intensity={LIGHT_CONFIG.lights[5].low} color="#224400"  distance={12} decay={2}   />
      <pointLight ref={goldGround} position={[0,  -3,  0]} intensity={LIGHT_CONFIG.lights[6].low} color="#ffaa22"  distance={14} decay={1.5} />
      <pointLight ref={tealCenter} position={[0,   0,  0]} intensity={LIGHT_CONFIG.lights[7].low} color="#00ffcc"  distance={16} decay={1.2} />
    </>
  )
}

export default function Main() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLowEnd, setIsLowEnd] = useState(false)

  // Detect mobile and low-end devices
  useEffect(() => {
    const checkDevice = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const lowEnd = mobile && (window.innerWidth < 768 || /Android [1-4]|iPhone OS [1-8]/.test(navigator.userAgent))
      
      setIsMobile(mobile)
      setIsLowEnd(lowEnd)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Disable expensive features on mobile
  const canvasProps = {
    camera: { position: [0, 0, 5], fov: isMobile ? 50 : 40 },
    gl: { 
      alpha: true,
      powerPreference: "low-power",
      antialias: !isLowEnd,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false
    },
    shadows: !isMobile, // Disable shadows on mobile
    style: { background: "transparent" },
    onCreated: ({ gl }) => {
      gl.setClearColor(0x000000, 0)
      // Limit pixel ratio on mobile
      if (isMobile) {
        const pixelRatio = Math.min(window.devicePixelRatio, 2)
        gl.setPixelRatio(pixelRatio)
      }
    }
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 15,
          pointerEvents: "auto"
        }}
        className="glow-bg"
      >
        <Canvas {...canvasProps}>
          <ambientLight intensity={isMobile ? 3 : 5} color="#000000" />

          {/* Reduce light count on mobile */}
          {!isLowEnd && <SceneLights />}
          
          {/* Fog — pure black, close start so edges fall off fast */}
          <fog attach="fog" args={["#000000", 5, 22]} />

          <Environment preset="city" background={false} />

          <ScrollController>
            <Scene1 />
            <Scene3 />
          </ScrollController>

          <OrbitControls
            enableZoom={false} // Disable zoom on mobile for better performance
            enablePan={false}
            enableTouchRotate={isMobile} // Enable touch rotate on mobile
            touchRotate={isMobile}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            makeDefault
          />
        </Canvas>
      </div>

      {/* Reduced height for mobile */}
      <div style={{ height: isMobile ? "100vh" : "200vh" }} />
      <Scene2 /> 
      <div style={{ height: isMobile ? "100vh" : "200vh" }} />  
    </>
  );
}