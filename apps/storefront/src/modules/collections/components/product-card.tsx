import type { BadgePosition, ProductBadges } from "@lib/data/product-badges"
import type { CardModel } from "../lib/to-card-model"
import QuickAddButton from "./quick-add-button"

type ProductCardProps = {
  card: CardModel
  countryCode: string
  /** pièce mise en avant, seule sur sa ligne : grande image (maquette). */
  featured?: boolean
  /** config globale des badges d'indication (image + coin) — null si aucune. */
  badges?: ProductBadges
}

/** Coin d'ancrage du badge sur l'image produit (défaut backend : top-left). */
const POSITION_CLASSES: Record<BadgePosition, string> = {
  "top-left": "left-2 top-2",
  "top-right": "right-2 top-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
}

/**
 * Carte produit de la page Collection (maquette `Collection.pdf`) : pastille
 * d'ambiance + titre (type romain / nom en italique) + sous-ligne variante,
 * puis un pied prix + bouton « + » (ajout rapide). En mode `featured`, l'image
 * est nettement plus grande et centrée. Composant serveur ; seul le « + » est
 * client.
 */
const ProductCard = ({
  card,
  countryCode,
  featured = false,
  badges,
}: ProductCardProps) => {
  const imageBox = featured
    ? "h-72 small:h-[26rem]"
    : "h-44 small:h-52"
  const titleSize = featured ? "text-2xl small:text-3xl" : "text-lg"

  // Badges à afficher sur l'image : « phare » si le produit est mis en avant,
  // « nouveau » si récent. Chacun au coin configuré côté admin (défaut : haut
  // gauche). On n'affiche que ceux dont l'image est bien uploadée.
  const activeBadges = [
    card.isFeatured ? badges?.featured : null,
    card.isNew ? badges?.new : null,
  ].filter((b): b is NonNullable<typeof b> => Boolean(b?.image_url))
  // Tampon-badge : marqué sur la pièce mise en avant, plus discret sur les
  // cartes standard. Ratio 3:2 conservé, object-contain pour ne pas déformer.
  const badgeSize = featured ? "h-[100px] w-[150px]" : "h-[64px] w-[96px]"

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

          {/* Badges ancrés au conteneur (fond ivoire), hors de la boîte image :
              ils se posent dans la marge du coin plutôt que sur l'image. */}
          {activeBadges.map((badge) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={badge.type}
              src={badge.image_url as string}
              alt={badge.label}
              className={`pointer-events-none absolute z-10 object-contain ${badgeSize} ${
                POSITION_CLASSES[badge.position]
              }`}
            />
          ))}
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
        <span className="font-mono text-sm text-ink">
          {card.price}
          {card.priceSuffix && (
            <span className="ml-1 text-ink/50">{card.priceSuffix}</span>
          )}
        </span>
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
