"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useEffect } from "react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

/**
 * Déclaratif : scanne le DOM pour des attributs `data-*` et branche les
 * animations GSAP correspondantes. Les sections restent des Server Components ;
 * il suffit de poser un attribut sur le markup.
 *
 *  - [data-reveal]              fondu + remontée à l'entrée dans le viewport
 *  - [data-reveal-group]        idem mais en cascade sur les enfants directs
 *  - [data-split]               titre révélé mot par mot (SplitText)
 *  - [data-parallax="0.3"]      translation à vitesse différente (scrub)
 *  - [data-hero-pin] + [data-candle]  hero épinglé : la bougie tourne/zoome au scroll
 */
const ScrollFX = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const ctx = gsap.context(() => {
      // Reveals simples
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 36 })
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () =>
            gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }),
        })
      })

      // Reveals en cascade (stagger sur les enfants directs)
      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = gsap.utils.toArray<HTMLElement>(group.children)
        gsap.set(items, { opacity: 0, y: 36 })
        ScrollTrigger.create({
          trigger: group,
          start: "top 80%",
          once: true,
          onEnter: () =>
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.12,
            }),
        })
      })

      // Titres mot par mot
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const split = new SplitText(el, { type: "words" })
        gsap.set(split.words, { opacity: 0, y: 24 })
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () =>
            gsap.to(split.words, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power4.out",
              stagger: 0.06,
            }),
        })
      })

      // Parallaxe
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || "0.3")
        gsap.to(el, {
          yPercent: -amount * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      })

      // Hero épinglé : la bougie tourne / zoome pendant le pin
      const heroPin = document.querySelector<HTMLElement>("[data-hero-pin]")
      const candle = document.querySelector<HTMLElement>("[data-candle]")
      if (heroPin && candle) {
        gsap.to(candle, {
          "--scroll": 1,
          ease: "none",
          scrollTrigger: {
            trigger: heroPin,
            start: "top top",
            end: "+=80%",
            pin: true,
            scrub: 1,
          },
        })
      }
    })

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  return null
}

export default ScrollFX
