"use client"

import { useRef } from "react"

const DESTINATIONS = [
  { name: "California", image: "/kult/imgh1.png" },
  { name: "Palm Beach", image: "/kult/imgh2.png" },
  { name: "Riviera", image: "/kult/imgh3.png" },
  { name: "Capri", image: "/kult/imgh4.png" },
]

const KultMotifs = () => {
  const sliderRef = useRef<HTMLDivElement>(null)

  return (
    <>
      {/* sep3 - transition crème vers bleu */}
      <div className="bg-[#fdf6ee]">
        <img src="/kult/sep3.png" alt="separateur" className="w-full" />
      </div>

      <section className="bg-[#2563eb] py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-10 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="text-white text-xs uppercase tracking-widest">Votre carte postale</span>
          </div>
          <h2 className="font-serif text-5xl text-white">
            Choisissez votre destination
          </h2>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-6 px-10 overflow-x-auto cursor-grab active:cursor-grabbing"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              className="flex-shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="h-[650px] w-auto object-contain rounded-lg"
              />
            </div>
          ))}
        </div>
      </section>

      {/* sep4 - transition bleu vers crème */}
      <div className="bg-[#fdf6ee]">
        <img src="/kult/sep4.png" alt="separateur" className="w-full" />
      </div>
    </>
  )
}

export default KultMotifs