import type {
  StoreAttribute,
  StoreTrustBadge,
} from "@lib/data/product-attributes"
import KultLeGeste from "./le-geste"
import KultNewsletter from "./newsletter"
import KultProductAccordions from "./product-accordions"
import KultProductBuyBox from "./product-buy-box"
import KultProductGallery from "./product-gallery"
import KultProductPrice from "./product-price"
import KultProductSpecs from "./product-specs"
import KultRelated from "./related"
import type { Piece } from "./pieces"

/** Convertit une valeur d'attribut (texte ou groupe) en chaîne affichable. */
const valueToText = (value: StoreAttribute["value"]): string => {
  if (typeof value === "string") {
    return value
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .filter((v) => v.trim().length > 0)
      .join(" · ")
  }
  return ""
}

const KultProductTemplate = ({
  piece,
  related,
  attributes,
  trustBadges,
}: {
  piece: Piece
  related: Piece[]
  attributes: StoreAttribute[]
  trustBadges: StoreTrustBadge[]
}) => {
  const accroche = attributes
    .filter((a) => a.zone === "accroche")
    .map((a) => valueToText(a.value))
    .filter((text) => text.trim().length > 0)
    .join(" · ")
  const specs = attributes.filter((a) => a.zone === "specs")
  const accordions = attributes
    .filter((a) => a.zone === "accordeon")
    .map((a) => ({ title: a.label, body: valueToText(a.value) }))
    .filter((item) => item.body.trim().length > 0)

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
              <span className="badge">{piece.categoryLabel}</span>

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
                {accroche && (
                  <span className="eyebrow text-ink/50">{accroche}</span>
                )}
              </div>

              <p className="mt-6 max-w-md whitespace-pre-line text-base leading-[1.7] text-ink/70">
                {piece.description}
              </p>

              {/* Specs dynamiques (pyramide, matière…) */}
              <KultProductSpecs specs={specs} />

              {/* Couleur + quantité + ajouter */}
              <KultProductBuyBox piece={piece} />

              {/* Réassurance (global app) */}
              {trustBadges.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {trustBadges.map((item) => (
                    <span key={item.id} className="badge">
                      <span>{item.icon}</span> {item.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Accordéons dynamiques */}
              <KultProductAccordions sections={accordions} />
            </div>
          </div>
        </div>

        {/* Bande damier */}
        <div className="motif-damier-soleil h-4 w-full" />
      </section>

      <KultLeGeste />
      <KultRelated pieces={related} />
      <KultNewsletter />
    </>
  )
}

export default KultProductTemplate
