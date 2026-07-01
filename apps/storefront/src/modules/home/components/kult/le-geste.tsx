const KultLeGeste = () => {
  return (
    <section className="relative overflow-hidden bg-marine text-ivory">
      <div className="tex-diagonal absolute inset-0 opacity-40" />
      {/* Pastille damier décorative */}
      <div className="motif-damier-soleil animate-kult-float absolute -right-6 top-16 hidden h-44 w-44 rounded-circle opacity-90 small:block" />

      <div className="kult-container relative flex min-h-[60vh] flex-col justify-end py-24 small:py-32">
        <span className="eyebrow text-soleil">Le geste</span>
        <h2 className="display mt-6 text-4xl small:text-6xl">
          On n'achète pas une bougie.
          <br />
          On invite le soleil à{" "}
          <span className="italic text-soleil">rester.</span>
        </h2>
      </div>
    </section>
  )
}

export default KultLeGeste
