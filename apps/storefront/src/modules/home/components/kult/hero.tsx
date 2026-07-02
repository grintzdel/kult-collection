"use client"

import { useEffect, useState } from "react"

const KultHero = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Vidéo de fond */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/kult/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Sticker tampon rond jaune - bas droite */}
      <img
        src="/kult/sticker3.png"
        alt="Kult Palm Beach"
        className="absolute bottom-20 right-10 z-10 w-32 opacity-90"
      />

      {/* Sticker bleu - haut droite */}
      <img
        src="/kult/sticker2.png"
        alt="Kult Collection"
        className="absolute bottom-2 right-8 z-10 w-32 opacity-90"
      />

      {/* Sticker rose - milieu droite */}
      <img
        src="/kult/sticker1.png"
        alt="Kult sticker"
        className="absolute bottom-20 right-1 z-10 w-32 opacity-90"
      />

      {/* Contenu principal */}
      <div className="relative z-10 flex h-full flex-col justify-start px-44 pt-48">
        <h1 className="font-serif text-8xl leading-tight text-white max-w-2xl whitespace-nowrap">
          Collect 
          memories,
          <br />
          not objects
        </h1>

        <a href="/collections"
          className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-green-700 px-6 py-3 text-sm uppercase tracking-widest text-white"
        >
          Découvrir nos collections ⟶
        </a>

        {/* Tags en bas */}
        <div className="absolute bottom-8 left-44 flex gap-4 text-green-400 text-xs uppercase tracking-widest">
          <span>Artisanat</span>
          <span>·</span>
          <span>Céramique</span>
          <span>·</span>
          <span>Bougies</span>
          <span>·</span>
          <span>Art de table</span>
        </div>
      </div>

      {/* Séparateur en bas */}
      <img
        src="/kult/separateur.png"
        alt="separateur"
        className="absolute bottom-0 left-0 right-0 w-full z-10"
      />
    </section>
  )
}

export default KultHero