import type { ProductBadges } from "@lib/data/product-badges"
import { chunkByPattern, type LayoutPattern } from "../lib/chunk-by-pattern"
import type { CardModel } from "../lib/to-card-model"
import ProductCard from "./product-card"

type CollectionGridProps = {
  cards: CardModel[]
  layout: LayoutPattern
  countryCode: string
  badges?: ProductBadges
}

/**
 * Grille à layout variable de la page Collection (maquette : 1 / 4 / 3).
 * Les lignes et colonnes sont dessinées par des traits verts (`menthe`).
 * La 1ʳᵉ ligne (pattern = 1) porte la pièce mise en avant, seule et à gauche.
 */
const CollectionGrid = ({
  cards,
  layout,
  countryCode,
  badges,
}: CollectionGridProps) => {
  if (cards.length === 0) {
    return (
      <p className="py-16 text-center font-serif text-2xl text-ink/60">
        Aucune pièce dans cette sélection.
      </p>
    )
  }

  const rows = chunkByPattern(cards, layout)

  return (
    <div className="w-full">
      {rows.map((row, rowIndex) => {
        const isSingle = row.length === 1

        return (
          <div
            key={rowIndex}
            className={`flex flex-col divide-y divide-menthe/60 small:flex-row small:divide-x small:divide-y-0 ${
              rowIndex > 0 ? "border-t border-menthe/60" : ""
            }`}
          >
            {row.map((card) => (
              <div
                key={card.handle}
                className={`px-6 py-8 ${
                  isSingle ? "small:w-full" : "small:flex-1 small:basis-0"
                }`}
              >
                <ProductCard
                  card={card}
                  countryCode={countryCode}
                  featured={isSingle}
                  badges={badges}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default CollectionGrid
