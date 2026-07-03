/**
 * Bannière de clôture de page produit : image pleine largeur + signature de la
 * collection en surimpression. Contenu statique et identique partout.
 */
const KultBanner = () => {
  return (
    <section className="relative isolate overflow-hidden bg-marine">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/kult/imgt2.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

      <div className="content-container relative flex min-h-[360px] flex-col justify-center py-20 small:min-h-[460px]">
        <span className="font-serif text-7xl leading-none text-ivory small:text-8xl">
          KULT
        </span>
        <span className="mt-5 font-mono text-sm uppercase tracking-label text-ivory/90">
          Collection
        </span>
        <span className="mt-2 font-mono text-xs uppercase tracking-label text-ivory/70">
          Été 2026
        </span>
      </div>
    </section>
  )
}

export default KultBanner
