import KultCandle3D from "./candle-3d"

const KultHero = () => {
  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="kult-container grid items-center gap-12 py-16 small:grid-cols-2 small:py-24">
        {/* Colonne texte */}
        <div className="animate-kult-rise">
          <span className="badge mb-7">
            <span className="text-soleil">✦</span> Nouvelle collection · Amore
          </span>

          <h1 className="display text-6xl text-ink small:text-7xl">
            Une maison
            <br />
            pleine de{" "}
            <span className="italic text-terracotta">soleil.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-[1.7] text-ink/70">
            Des bougies en céramique coulées à la main, entre le Sud de la France
            et la Californie. On commence par la couleur et la matière — la vente
            vient après.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="/store" className="btn-dark btn-lg">
              Voir la collection
            </a>
            <a href="#savoir-faire" className="btn-link">
              Découvrir l'univers ↓
            </a>
          </div>
        </div>

        {/* Colonne visuelle — 3D candle */}
        <KultCandle3D />
      </div>
    </section>
  )
}

export default KultHero
