"use client"

import Image from "next/image"
import { useRef, useEffect } from "react"
import Lottie from "lottie-react"
import animationData from "@/public/video/bg-video.json"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const IMAGES = [
  "/1.avif", "/2.avif", "/3.avif", "/4.avif",
  "/5.avif", "/6.avif", "/7.avif", "/8.avif", "/9.avif",
]

const LAYOUT = [
  { width: 460, height: 400, marginTop: -300 },
  { width: 220, height: 200, marginTop: 300 },
  { width: 240, height: 220, marginTop: -250 },
  { width: 480, height: 420, marginTop: 300 },
  { width: 200, height: 180, marginTop: -400 },
  { width: 260, height: 240, marginTop: 350 },
  { width: 440, height: 380, marginTop: -40 },
  { width: 210, height: 190, marginTop: 380 },
  { width: 250, height: 230, marginTop: -400 },
]

export default function Scene4() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const images = track.children

    // 🔥 horizontal scroll
    const totalWidth = track.scrollWidth - window.innerWidth

    gsap.to(track, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2, // 🔥 SMOOTHNESS CONTROL (higher = smoother)
      },
    })

    // 🔥 subtle floating (parallax per card)
    gsap.utils.toArray<HTMLElement>(images).forEach((el, i) => {
      gsap.to(el, {
        y: () => Math.sin(i) * 40,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      })
    })

    // 🔥 velocity-based depth feel
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = self.getVelocity()

        gsap.to(track, {
          skewX: velocity * 0.00005, // subtle
          duration: 0.3,
          ease: "power2.out",
        })
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-black">

        {/* 🔥 Lottie Background (UNCHANGED) */}
        <div className="absolute inset-0 -top-80 -z-10 opacity-10">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            className="w-full h-[200vh] object-cover"
          />
        </div>

        {/* TRACK */}
        <div className="relative z-10 w-full h-full">
          <div
            ref={trackRef}
            className="absolute top-0 left-0 h-full flex items-center gap-6 px-16 will-change-transform"
          >
            {IMAGES.map((src, i) => {
              const l = LAYOUT[i] || LAYOUT[0]

              return (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-lg overflow-hidden"
                  style={{
                    width: l.width,
                    height: l.height,
                    marginTop: l.marginTop,
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    height={l.height}
                    width={l.width}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}