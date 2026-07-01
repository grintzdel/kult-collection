const KultCommentChoisir = () => {
  return (
    <section className="relative overflow-hidden bg-marine text-ivory">
      {/* Pastille damier décorative */}
      <div className="motif-damier-soleil animate-kult-float absolute -right-10 top-10 hidden h-44 w-44 rounded-circle opacity-90 small:block" />

      <div className="kult-container relative py-24 small:py-28">
        <div className="max-w-2xl">
          <span className="eyebrow text-soleil">Comment choisir</span>
          <h2 className="display mt-5 text-4xl small:text-5xl">
            On ne choisit pas un parfum.
            <br />
            On choisit une{" "}
            <span className="italic text-soleil">couleur.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-[1.7] text-ivory/70">
            Chaque pièce existe d'abord comme objet. Le parfum suit la teinte :
            néroli pour le soleil, sel pour le marine, ambre pour la terracotta.
          </p>
        </div>
      </div>
    </section>
  )
}

export default KultCommentChoisir
