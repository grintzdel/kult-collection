import KultLeGeste from "./le-geste"
import KultNewsletter from "./newsletter"
import KultProductAccordions from "./product-accordions"
import KultProductBuyBox from "./product-buy-box"
import KultProductGallery from "./product-gallery"
import KultProductPrice from "./product-price"
import KultRelated from "./related"
import type { Piece } from "./pieces"

const TRUST = [
  { icon: "♻", label: "Contenant réutilisable" },
  { icon: "✺", label: "Fait main à Grasse" },
  { icon: "↘", label: "Livraison soignée 2–4 j" },
]

const KultProductTemplate = ({
  piece,
  related,
}: {
  piece: Piece
  related: Piece[]
}) => {
  return (
    <>
      <section className="bg-ivory">
        <div className="kult-container pb-16 pt-12">
          {/* Fil d'Ariane */}
          <nav className="eyebrow text-ink/40">
            <a href="/" className="transition-colors hover:text-ink">
              Maison
            </a>
            <span className="mx-2 text-ink/30">·</span>
            <a href="/collections" className="transition-colors hover:text-ink">
              Collections
            </a>
            <span className="mx-2 text-terracotta">·</span>
            <span className="text-terracotta">{piece.name}</span>
          </nav>

          <div className="mt-10 grid gap-12 small:grid-cols-2 small:gap-16">
            {/* Galerie */}
            <KultProductGallery piece={piece} />

            {/* Infos */}
            <div>
              <span className="badge">
                {piece.categoryLabel} · Cire de soja
              </span>

              <h1 className="display mt-6 text-6xl text-ink">
                {piece.name}
                <span className="text-terracotta">.</span>
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <KultProductPrice
                  amount={piece.amount}
                  currencyCode={piece.currencyCode}
                  isTaxInclusive={piece.isTaxInclusive}
                  className="font-serif text-3xl text-ink"
                />
                <span className="eyebrow text-ink/50">{piece.notes}</span>
              </div>

              <p className="mt-6 max-w-md whitespace-pre-line text-base leading-[1.7] text-ink/70">
                {piece.description}
              </p>

              {/* Pyramide olfactive */}
              <div className="mt-8 grid grid-cols-3 gap-4 rounded-large bg-cream p-6">
                <div>
                  <span className="eyebrow text-terracotta">Tête</span>
                  <p className="mt-2 font-serif text-base text-ink">
                    {piece.pyramid.tete}
                  </p>
                </div>
                <div>
                  <span className="eyebrow text-terracotta">Cœur</span>
                  <p className="mt-2 font-serif text-base text-ink">
                    {piece.pyramid.coeur}
                  </p>
                </div>
                <div>
                  <span className="eyebrow text-terracotta">Fond</span>
                  <p className="mt-2 font-serif text-base text-ink">
                    {piece.pyramid.fond}
                  </p>
                </div>
              </div>

              {/* Couleur + quantité + ajouter */}
              <KultProductBuyBox piece={piece} />

              {/* Réassurance */}
              <div className="mt-7 flex flex-wrap gap-3">
                {TRUST.map((item) => (
                  <span key={item.label} className="badge">
                    <span>{item.icon}</span> {item.label}
                  </span>
                ))}
              </div>

              {/* Accordéons */}
              <KultProductAccordions sections={piece.sections} />
            </div>
          </div>
        </div>

        {/* Bande damier */}
        <div className="motif-damier-soleil h-4 w-full" />
      </section>

      <KultLeGeste />
      <KultRelated pieces={related} />
      <KultNewsletter title="Les nouvelles pièces, avant tout le monde." />
    </>
  )
}

export default KultProductTemplate
