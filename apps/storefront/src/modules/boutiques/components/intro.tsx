// Intro « Nos boutiques » — eyebrow, titre serif, accroche.

const BoutiquesIntro = () => {
  return (
    <section className="bg-ivory">
      <div className="kult-container py-16 small:py-20">
        <span className="eyebrow text-marine">— Venez nous voir</span>

        <h1 className="display mt-6 text-5xl text-ink small:text-6xl">
          Nos boutiques
        </h1>

        <p className="mt-7 max-w-xl text-base leading-[1.7] text-ink/70">
          Nous avons hâte de vous recevoir et de vous initier à cette nouvelle
          expérience en physique, en espérant que vous repartirez{" "}
          <span className="font-medium text-ink">la tête pleine de souvenirs</span> !
        </p>
      </div>
    </section>
  )
}

export default BoutiquesIntro
