
import Lenis from "@studio-freight/lenis"

let lenis: Lenis | null = null
let scroll = 0

export function initLenis() {
  if (lenis) return

  lenis = new Lenis({
    lerp: 0.02,          
    smoothWheel: true,
  })

  lenis.on("scroll", (e: any) => {
    scroll = e.scroll
  })

  function raf(time: number) {
    lenis!.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}

export function getLenisScroll() {
  return scroll
}

export function getLenisProgress() {
  return scroll / window.innerHeight
}