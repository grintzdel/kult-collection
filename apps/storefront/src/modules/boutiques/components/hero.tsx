// Hero pleine largeur — photo d'ambiance de la boutique + logo « KULT market ».
// Média non fourni : placeholder en attendant l'asset définitif.

const BoutiquesHero = () => {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Placeholder média — remplacer par la photo de boutique */}
      <div
        data-placeholder="hero-boutique"
        className="flex aspect-[16/7] w-full items-center justify-center bg-sand"
      >
        <span className="eyebrow text-ink/30">Photo boutique</span>
      </div>

      {/* Logo KULT market en surimpression */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-ivory">
        <span className="display text-7xl leading-none tracking-tight small:text-8xl">
          KULT
        </span>
        <span className="-mt-2 font-serif text-3xl italic small:text-4xl">
          market
        </span>
      </div>
    </section>
  )
}

export default BoutiquesHero
