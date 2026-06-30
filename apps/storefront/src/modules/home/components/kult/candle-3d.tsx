"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

// Rotation/échelle de la scène, pilotées par les CSS custom properties.
// Valeurs par défaut (0) → rendu statique tant que le hook n'a rien écrit
// (et en prefers-reduced-motion, où le hook ne s'attache pas).
const STAGE_TRANSFORM =
  "rotateY(calc(var(--rx, 0) * 12deg)) " +
  "rotateX(calc(var(--ry, 0) * -12deg)) " +
  "translateY(calc(var(--sp, 0) * -40px)) " +
  "rotateZ(calc(var(--sp, 0) * -4deg)) " +
  "scale(calc(1 - var(--sp, 0) * 0.08))"

const useHero3D = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReduced) {
      return
    }

    const canHover = window.matchMedia("(hover: hover)").matches

    let targetRx = 0
    let targetRy = 0
    let targetSp = 0
    let curRx = 0
    let curRy = 0
    let curSp = 0
    let raf = 0

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      targetRx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      targetRy = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
    }

    const onPointerLeave = () => {
      targetRx = 0
      targetRy = 0
    }

    const computeScroll = () => {
      const rect = el.getBoundingClientRect()
      targetSp = clamp(-rect.top / window.innerHeight, 0, 1)
    }

    const tick = () => {
      curRx = lerp(curRx, targetRx, 0.1)
      curRy = lerp(curRy, targetRy, 0.1)
      curSp = lerp(curSp, targetSp, 0.12)
      el.style.setProperty("--rx", curRx.toFixed(4))
      el.style.setProperty("--ry", curRy.toFixed(4))
      el.style.setProperty("--sp", curSp.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    if (canHover) {
      el.addEventListener("pointermove", onPointerMove)
      el.addEventListener("pointerleave", onPointerLeave)
    }
    window.addEventListener("scroll", computeScroll, { passive: true })
    computeScroll()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("scroll", computeScroll)
    }
  }, [])

  return ref
}

const KultCandle3D = () => {
  const ref = useHero3D()

  return (
    <div ref={ref} className="relative h-[360px] small:h-[460px] [perspective:900px]">
      <div
        className="absolute inset-0 will-change-transform [transform-style:preserve-3d]"
        style={{ transform: STAGE_TRANSFORM }}
      >
        {/* Plan arrière — halo */}
        <div
          className="halo-soleil absolute left-1/2 top-1/2 h-[300px] w-[300px] rounded-circle small:h-[360px] small:w-[360px]"
          style={{ transform: "translate(-50%, -50%) translateZ(-60px)" }}
        />

        {/* Plan milieu — la bougie */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(0px)" }}
        >
          <Image
            src="/kult/candle-lavande.png"
            alt="Bougie KULT Lavande & Camomille"
            width={500}
            height={500}
            priority
            className="h-auto w-[220px] drop-shadow-2xl small:w-[280px]"
          />
        </div>

        {/* Plan avant — pastille motif + badge */}
        <div
          className="motif-damier absolute left-4 top-6 h-20 w-20 rounded-circle opacity-90 small:h-24 small:w-24"
          style={{ transform: "translateZ(80px)" }}
        />
        <span
          className="badge absolute bottom-2 left-1/2 whitespace-nowrap"
          style={{ transform: "translate(-50%, 0) translateZ(80px)" }}
        >
          Lavande &amp; Camomille
        </span>
      </div>
    </div>
  )
}

export default KultCandle3D
