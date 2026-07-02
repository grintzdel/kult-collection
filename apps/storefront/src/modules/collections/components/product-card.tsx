import type { CardModel } from "../lib/to-card-model"
import QuickAddButton from "./quick-add-button"

type ProductCardProps = {
  card: CardModel
  countryCode: string
  /** pièce mise en avant, seule sur sa ligne : grande image (maquette). */
  featured?: boolean
}

/**
 * Carte produit de la page Collection (maquette `Collection.pdf`) : pastille
 * d'ambiance + titre (type romain / nom en italique) + sous-ligne variante,
 * puis un pied prix + bouton « + » (ajout rapide). En mode `featured`, l'image
 * est nettement plus grande et centrée. Composant serveur ; seul le « + » est
 * client.
 */
const ProductCard = ({ card, countryCode, featured = false }: ProductCardProps) => {
  const imageBox = featured
    ? "h-72 small:h-[26rem]"
    : "h-44 small:h-52"
  const titleSize = featured ? "text-2xl small:text-3xl" : "text-lg"

  return (
    <article className="group flex h-full flex-col">
      <a
        href={`/products/${card.handle}`}
        className="flex flex-1 flex-col"
      >
        <div
          className={`relative flex items-center justify-center overflow-hidden bg-ivory ${
            featured ? "py-4" : "flex-1 p-6"
          }`}
        >
          {card.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.image}
              alt={card.name}
              className={`w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] ${imageBox}`}
            />
          ) : (
            <div className={`flex w-full items-center justify-center ${imageBox}`}>
              <span className="halo-soleil h-24 w-24 rounded-circle opacity-70" />
            </div>
          )}
        </div>

        <div className={featured ? "pt-6" : "pt-4"}>
          {card.ambianceLabel && (
            <div className="mb-2 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-circle bg-ink/20"
                style={
                  card.ambianceColor
                    ? { backgroundColor: card.ambianceColor }
                    : undefined
                }
                aria-hidden
              />
              <span className="font-mono text-[10px] uppercase tracking-label text-ink/50">
                {card.ambianceLabel}
              </span>
            </div>
          )}

          <h3 className={`font-serif leading-tight text-ink ${titleSize}`}>
            {card.titleLead && <span>{card.titleLead} </span>}
            <em className="italic">{card.titleEmphasis}</em>
          </h3>

          {card.variantLabel && (
            <p className="mt-1 font-serif text-sm italic text-ink/45">
              {card.variantLabel}
            </p>
          )}
        </div>
      </a>

      <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="font-mono text-sm text-ink">{card.price}</span>
        <QuickAddButton
          variantId={card.variantId}
          countryCode={countryCode}
          label={card.name}
        />
      </div>
    </article>
  )
}

export default ProductCard
