"use client"

import { ReactLenis } from "lenis/react"

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.06,        // 🔥 smoothness (0.05–0.12 sweet spot)
        duration: 1.2,     // fallback duration
        smoothWheel: true,
        touchMultiplier: 1.5,
      }}
    >
      {children}
    </ReactLenis>
  )
}