const KultCollectionHero = () => {
  return (
    <section className="bg-ivory">
      <div className="kult-container pb-10 pt-14 small:pt-20">
        {/* Fil d'Ariane */}
        <nav className="eyebrow text-ink/40">
          <a href="/" className="transition-colors hover:text-ink">
            Maison
          </a>
          <span className="mx-2 text-terracotta">·</span>
          <span className="text-terracotta">Collections</span>
        </nav>

        <div className="mt-10 grid gap-8 small:grid-cols-2 small:items-end">
          <div>
            <span className="eyebrow text-ink/50">La collection — 06 pièces</span>
            <h1 className="display mt-5 text-6xl text-ink small:text-7xl">
              Des pièces
              <br />à{" "}
              <span className="italic text-terracotta">collectionner.</span>
            </h1>
          </div>
          <p className="max-w-md text-base leading-[1.7] text-ink/70 small:pb-3">
            Des bougies en céramique coulées une à une, entre le Sud de la France
            et la Californie. Une couleur, une matière, un parfum de Grasse — à
            garder bien après la dernière flamme.
          </p>
        </div>
      </div>

      {/* Bande damier */}
      <div className="motif-damier-soleil h-4 w-full" />
    </section>
  )
}

export default KultCollectionHero
