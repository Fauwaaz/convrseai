"use client"

import Image from "next/image"
import { useState } from "react"
import Lottie from "lottie-react"
import animationData from "@/public/video/bg-video.json"

const IMAGES = [
  "/1.avif",
  "/2.avif",
  "/3.avif",
  "/4.avif",
  "/5.avif",
]

export default function Scene5() {
  const [active, setActive] = useState<number | null>(2) // center default

  return (
    <section className="relative h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -top-80 -z-10 opacity-10">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="w-full h-[200vh] object-cover"
        />
      </div>

      <div className="relative flex items-center justify-center gap-[-120px]">

        {IMAGES.map((src, i) => {
          const offset = i - 2 // center index = 2

          const isActive = active === i

          return (
            <div
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(2)}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `
                  translateX(${offset * 220}px)
                  translateY(${isActive ? -40 : 0}px)
                  rotate(${offset * 8}deg)
                  scale(${isActive ? 1.05 : 0.9})
                `,
                zIndex: isActive ? 20 : 10 - Math.abs(offset),
                opacity: active !== null && !isActive ? 1 : 1,
              }}
            >
              <div className="w-[300px] h-[600px] rounded-4xl overflow-hidden shadow-2xl">
                <Image
                  alt="Image"
                  src={src}
                  className="w-full h-full object-cover"
                  draggable={false}
                  height={100}
                  width={100}
                  unoptimized
                />
              </div>
            </div>
          )
        })}

      </div>

    </section>
  )
}