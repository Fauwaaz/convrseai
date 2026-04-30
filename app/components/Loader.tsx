import { useEffect, useRef, useState } from "react"
import { useProgress } from "@react-three/drei"

export default function Loader() {
    const { progress } = useProgress()  // ← R3F built-in GLB progress
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const tRef = useRef(0)
    const glitchChars = "///996/9/6/9/96/76/9/6/9".split("")

    const labels = ["PARSING GEOMETRY", "LOADING TEXTURES", "BUILDING SHADERS", "COMPILING SCENE", "READY"]
    const labelIdx = Math.floor((progress / 100) * (labels.length - 1))

    useEffect(() => {
        const canvas = canvasRef.current!
        if (!canvas) return
        const ctx = canvas.getContext("2d")!
        if (!ctx) return
        let raf: number

        const resize = () => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener("resize", resize)

        const frame = () => {
            tRef.current += 0.016
            const t = tRef.current
            const W = canvas.width, H = canvas.height
            const cx = W / 2, cy = H / 2

            // bg
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7)
            grad.addColorStop(0, "rgba(2,8,22,1)")
            grad.addColorStop(1, "rgba(0,0,0,1)")
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, W, H)

            // side arcs
            for (let i = 0; i < 4; i++) {
                const phase = t * 0.4 + i * 0.6
                    ;[cx * 0.18 + Math.sin(phase) * 18, W - cx * 0.18 - Math.sin(phase) * 18].forEach((x, side) => {
                        ctx.save()
                        ctx.strokeStyle = `rgba(20,100,200,${0.12 + Math.sin(t * 0.7 + i) * 0.06})`
                        ctx.lineWidth = 0.8
                        ctx.beginPath()
                        ctx.arc(x, cy + Math.sin(t * 0.3 + i) * 10, 60 + i * 28,
                            side === 0 ? -Math.PI * 0.7 : Math.PI * 0.3,
                            side === 0 ? Math.PI * 0.7 : Math.PI * 1.7)
                        ctx.stroke()
                        ctx.restore()
                    })
            }

            // petals
            ctx.save(); ctx.translate(cx, cy)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + t * 0.08
                const pulse = 0.5 + Math.sin(t * 1.2 + i * 0.9) * 0.5
                const len = 155 + pulse * 60
                ctx.save(); ctx.rotate(angle)
                const g = ctx.createLinearGradient(100, 0, len + 40, 0)
                g.addColorStop(0, `rgba(20,100,200,${0.55 * pulse})`)
                g.addColorStop(1, "rgba(10,40,120,0)")
                ctx.beginPath()
                ctx.moveTo(100, -4); ctx.quadraticCurveTo(len * 0.5, -10, len + 40, 0)
                ctx.quadraticCurveTo(len * 0.5, 10, 100, 4)
                ctx.closePath(); ctx.fillStyle = g; ctx.fill()
                ctx.restore()
            }
            ctx.restore()

                // outer rings
                ;[{ r: 155, a: 0.35, w: 1.2 }, { r: 168, a: 0.18, w: 0.6 }].forEach(({ r, a, w }) => {
                    ctx.save()
                    ctx.strokeStyle = `rgba(30,140,220,${a * (0.85 + Math.sin(t * 0.9 + r) * 0.15)})`
                    ctx.lineWidth = w; ctx.shadowColor = "rgba(50,180,255,0.5)"; ctx.shadowBlur = 8
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
                    ctx.restore()
                })

            // inner disk + hatch
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(3,8,18,0.96)"; ctx.fill(); ctx.restore()
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 128, 0, Math.PI * 2); ctx.clip()
            ctx.strokeStyle = "rgba(60,120,180,0.12)"; ctx.lineWidth = 0.6
            for (let x = cx - 130; x < cx + 130; x += 8) { ctx.beginPath(); ctx.moveTo(x, cy - 130); ctx.lineTo(x - 40, cy + 130); ctx.stroke() }
            ctx.restore()

            // glitch chars
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.clip()
            ctx.font = "9px monospace"; ctx.textAlign = "center"
            for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) {
                const isCenter = r === 4
                ctx.fillStyle = isCenter ? `rgba(180,240,255,${0.7 + Math.random() * 0.3})` : `rgba(80,180,220,${0.1 + Math.random() * 0.25})`
                ctx.fillText(glitchChars[Math.floor(Math.random() * glitchChars.length)], cx - 45 + c * 10, cy - 30 + r * 10)
            }
            ctx.restore()

            // main ring
            ctx.save(); ctx.shadowColor = "rgba(60,200,255,0.7)"; ctx.shadowBlur = 18
            ctx.strokeStyle = `rgba(50,190,255,${0.75 + Math.sin(t * 1.1) * 0.25})`
            ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.stroke()
            const sx = cx + Math.cos(t * 0.5) * 130, sy = cy + Math.sin(t * 0.5) * 130
            const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14)
            sg.addColorStop(0, "rgba(150,230,255,0.9)"); sg.addColorStop(1, "rgba(50,150,255,0)")
            ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.fill()
            ctx.restore()

            // orbit dot
            const dx = cx + Math.cos(-t * 0.9) * 145, dy = cy + Math.sin(-t * 0.9) * 145
            const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 7)
            dg.addColorStop(0, "rgba(120,210,255,1)"); dg.addColorStop(1, "rgba(40,120,200,0)")
            ctx.save(); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dx, dy, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore()

            // center >>>
            ctx.save(); ctx.font = "500 13px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
            ctx.fillStyle = `rgba(160,235,255,${0.6 + Math.sin(t * 2) * 0.4})`
            ctx.shadowColor = "rgba(80,200,255,0.8)"; ctx.shadowBlur = 10
            ctx.fillText(">>>", cx, cy); ctx.restore()

            raf = requestAnimationFrame(frame)
        }
        frame()
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
    }, [])

    if (progress >= 100) return null  // unmount when loaded

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, pointerEvents: "none", fontFamily: "monospace" }}>
                <div style={{ fontSize: 13, letterSpacing: "0.18em", color: "rgba(180,230,255,0.85)", textTransform: "uppercase" }}>
                    {labels[Math.min(labelIdx, labels.length - 1)]}
                </div>
                <div style={{ fontSize: 22, letterSpacing: "0.08em", color: "rgba(100,200,255,0.9)" }}>
                    {Math.round(progress)}%
                </div>
                <div style={{ width: 160, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "rgba(80,200,255,0.8)", transition: "width 0.1s linear" }} />
                </div>
            </div>
        </div>
    )
}