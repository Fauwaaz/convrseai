"use client"

import Image from "next/image"
import { useRef, useEffect, useState } from "react"

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
    const offsetRef = useRef(0)
    const targetRef = useRef(0)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const section = sectionRef.current
        const track = trackRef.current
        if (!section || !track) return

        let velocity = 0

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t

        const tick = () => {
            const diff = targetRef.current - offsetRef.current

            // 🔥 velocity-based smoothing
            velocity += diff * 0.06
            velocity *= 0.8

            offsetRef.current += velocity

            track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`

            rafRef.current = requestAnimationFrame(tick)
        }

        const handleScroll = () => {
            const rect = section.getBoundingClientRect()
            const total = window.innerHeight + rect.height
            const scrolled = window.innerHeight - rect.top
            const progress = Math.min(Math.max(scrolled / total, 0), 1)

            const maxScroll = track.scrollWidth - window.innerWidth
            targetRef.current = progress * maxScroll
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()
        rafRef.current = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className="relative h-[300vh]"
        >
            <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-black">
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

                                    // 🔥 subtle depth movement
                                    transform: `translateY(${Math.sin(offsetRef.current * 0.002 + i) * 10}px)`
                                }}
                            >
                                <Image
                                    src={src}
                                    alt=""
                                    height={l.height}
                                    width={l.width}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}