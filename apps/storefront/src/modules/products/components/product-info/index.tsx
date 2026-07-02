import type { ProductAmbiance } from "@lib/data/collection-ambiances"

import ProductRating from "../product-rating"
import ProductTag from "../product-tag"
import QuantityAdd from "../quantity-add"
import ScentSelector, { type ScentOption } from "../scent-selector"

type ProductInfoProps = {
  /** ligne 1 (romain) — sous-catégorie, ex. « Bougie céramique » */
  subCategory: string
  /** ligne 2 (italique) — senteur, ex. « Crème solaire » */
  scent: string
  /** prix formaté, ex. « 45 € » */
  price: string
  ambiance: ProductAmbiance | null
  description: string
  /** notes olfactives condensées, ex. « Noix de coco · Fleur d'oranger · Vanille » */
  olfactiveNotes: string
  scents: ScentOption[]
  variantId: string | null
}

const Divider = () => <div className="border-t border-[#242121]/15" />

/**
 * Colonne d'informations produit (carte bordée). Sections empilées en
 * flex-col gap 27px, dans l'ordre de la maquette — jusqu'au CTA.
 */
const ProductInfo = ({
  subCategory,
  scent,
  price,
  ambiance,
  description,
  olfactiveNotes,
  scents,
  variantId,
}: ProductInfoProps) => {
  return (
    <div className="flex w-full flex-col gap-[27px] rounded-sm border border-[#242121]/15 p-8 small:max-w-[460px]">
      {/* 1. Tag + pastille couleur */}
      {ambiance && <ProductTag value={ambiance.value} color={ambiance.color} />}

      {/* 2. Nom + prix (flex-col gap 16px) */}
      <div className="flex flex-col gap-[16px]">
        <h1 className="font-serif text-[30px] leading-[1.12] text-ink">
          {subCategory && <span className="block">{subCategory}</span>}
          <span className="block italic">{scent}</span>
        </h1>
        <p className="font-serif text-[22px] text-ink">{price}</p>
      </div>

      {/* 3. Avis */}
      <ProductRating />

      {/* 4. Divider */}
      <Divider />

      {/* 5. Description */}
      <div className="flex flex-col gap-2">
        <span className="eyebrow text-ink/50">Description</span>
        <p className="whitespace-pre-line text-sm leading-[1.7] text-ink/70">
          {description}
        </p>
      </div>

      {/* 6. Notes olfactives */}
      {olfactiveNotes && (
        <div className="flex flex-col gap-2">
          <span className="eyebrow text-ink/50">Notes olfactives</span>
          <p className="text-sm text-ink">{olfactiveNotes}</p>
        </div>
      )}

      {/* 7. Divider */}
      <Divider />

      {/* 8. Odeurs (produits frères) */}
      <ScentSelector activeLabel={scent} scents={scents} />

      {/* 9 + 10. Quantité + CTA ajout au panier */}
      <QuantityAdd variantId={variantId} />
    </div>
  )
}

export default ProductInfo
