/**
 * Section « manifeste » de la marque. Contenu 100 % statique et identique sur
 * toutes les pages produit (rappel de marque) : titre, deux paragraphes, et une
 * carte postale d'ambiance tamponnée KULT à droite.
 */
const BrandReminder = () => {
  return (
    <section className="bg-ivory">
      <div className="content-container py-16 small:py-24">
        <div className="grid items-center gap-12 small:grid-cols-2 small:gap-16">
          {/* Texte */}
          <div>
            <span className="eyebrow text-marine">— Notre manifeste</span>
            <h2 className="display mt-4 text-5xl text-ink small:text-6xl">
              L'art de faire durer l'été
            </h2>
            <p className="mt-8 max-w-md text-base leading-[1.8] text-ink/75">
              Chez KULT, chaque création raconte un souvenir de vacances. Des
              couleurs qui rappellent les façades d'Andalousie, des rayures
              inspirées des plages méditerranéennes et des pièces façonnées à la
              main par des artisans passionnés.
            </p>
            <p className="mt-6 max-w-md text-base leading-[1.8] text-ink/75">
              Entre Paris et le sud de l'Europe, nous imaginons une collection
              solaire, joyeuse et intemporelle, pensée pour apporter un air d'été
              à votre quotidien.
            </p>
          </div>

          {/* Carte postale d'ambiance */}
          <div className="flex items-center justify-center gap-6 small:justify-end">
            <span className="hidden font-mono text-[10px] uppercase tracking-label text-ink/35 [writing-mode:vertical-rl] small:block">
              Postcard no. 014
            </span>
            <div className="w-full max-w-md rotate-2 shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kult/imgh4.png"
                alt="Carte postale KULT — Méditerranée"
                className="w-full rounded-rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandReminder
