const BADGES = [
  { icon: "♻", label: "Cire de soja" },
  { icon: "✺", label: "Parfums de Grasse" },
  { icon: "↻", label: "Réutilisable" },
]

const KultSavoirFaire = () => {
  return (
    <section id="savoir-faire" className="bg-ivory">
      <div className="kult-container grid items-center gap-12 py-24 small:grid-cols-2 small:py-28">
        {/* Panneau image — intérieur ensoleillé */}
        <div
          data-reveal
          className="animate-kult-float relative aspect-square overflow-hidden rounded-large bg-terracotta shadow-soft"
        >
          <div className="halo-soleil animate-kult-halo absolute inset-0" />
          <span className="absolute bottom-5 left-1/2 w-full -translate-x-1/2 px-6 text-center font-mono text-[9px] uppercase tracking-label text-ivory/80">
            [ Intérieur ensoleillé, bord de mer — bougies en situation ]
          </span>
        </div>

        {/* Texte */}
        <div>
          <span className="eyebrow text-ink/50">Savoir-faire</span>
          <h2 data-split className="display mt-4 text-4xl text-ink small:text-5xl">
            Fait main,{" "}
            <span className="italic text-marine">sans bruit.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-[1.7] text-ink/70">
            On préfère faire bien, lentement, que faire beaucoup. Cire végétale,
            mèches en coton, parfums de Grasse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {BADGES.map((badge) => (
              <span key={badge.label} className="badge">
                <span>{badge.icon}</span> {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default KultSavoirFaire
