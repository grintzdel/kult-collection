import type { Piece } from "@modules/home/components/kult/pieces"

import LotCard from "./lot-card"

type ProductLotProps = {
  /** pièces curées de la collection « Composez votre lot » */
  pieces: Piece[]
}

/**
 * Section « Composez votre lot » : sélection curée (collection Medusa dédiée)
 * présentée en rangée bordée, chaque pièce ajoutable au panier via son « + ».
 * Ce n'est pas du « related » — la sélection est la même sur chaque page produit.
 */
const ProductLot = ({ pieces }: ProductLotProps) => {
  if (!pieces.length) {
    return null
  }

  const row = pieces.slice(0, 6)

  return (
    <section className="bg-ivory">
      <div className="content-container py-16 small:py-20">
        <span className="eyebrow text-marine">— Composez votre lot</span>
        <h2 className="display mt-3 text-5xl text-ink small:text-6xl">
          Notre sélection pour vous
        </h2>

        <div className="no-scrollbar mt-10 flex divide-x divide-ink/10 overflow-x-auto border-y border-ink/10">
          {row.map((piece) => (
            <div
              key={piece.handle}
              className="w-1/2 shrink-0 xsmall:w-1/3 small:w-1/6"
            >
              <LotCard piece={piece} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductLot
