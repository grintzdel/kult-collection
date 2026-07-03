import type { ProductAmbiance } from "@lib/data/collection-ambiances"
import type { StoreAttribute } from "@lib/data/product-attributes"
import { HttpTypes } from "@medusajs/types"
import { toPiece } from "@modules/home/components/kult/pieces"
import type { Piece } from "@modules/home/components/kult/pieces"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { pickLeafCategory } from "../lib/siblings"
import type { CustomPieceContent } from "../lib/custom-piece"

import ProductGallery from "../components/product-gallery"
import ProductInfo from "../components/product-info"
import ProductLot from "../components/product-lot"
import CustomPiece from "../components/custom-piece"
import BrandReminder from "../components/brand-reminder"
import KultBanner from "../components/kult-banner"
import type { ScentOption } from "../components/scent-selector"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  /** produits-senteurs de la même gamme (collection « bougies parfumées ») */
  siblings: HttpTypes.StoreProduct[]
  attributes: StoreAttribute[]
  ambiance: ProductAmbiance | null
  /** sélection curée « Composez votre lot » (collection dédiée) */
  lotPieces: Piece[]
  /** contenu « pièce personnalisée » de la catégorie (null = section masquée) */
  customPiece: CustomPieceContent | null
}

/** « Bougie Violette » -> « Violette » (repli si metadata.senteur absent). */
const scentFromTitle = (title: string): string =>
  title.replace(/^Bougie\s+/i, "").trim()

/** senteur structurée d'un produit (metadata.senteur sinon dérivée du titre). */
const scentOf = (product: HttpTypes.StoreProduct): string => {
  const meta = (product.metadata?.senteur as string | undefined)?.trim()
  return meta && meta.length > 0 ? meta : scentFromTitle(product.title ?? "")
}

/** Rend une valeur d'attribut (texte ou groupe) en chaîne affichable. */
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

const ProductTemplate = ({
  product,
  siblings,
  attributes,
  ambiance,
  lotPieces,
  customPiece,
}: ProductTemplateProps) => {
  const piece = toPiece(product)
  // Sous-catégorie feuille (« Tasse » plutôt que le parent « Art de la table »
  // quand le produit est rattaché aux deux).
  const subCategory = pickLeafCategory(product.categories)?.name ?? ""
  const scent = scentOf(product)

  // Notes olfactives : zone éditoriale « accroche », condensée en « · ».
  const olfactiveNotes = attributes
    .filter((a) => a.zone === "accroche")
    .map((a) => valueToText(a.value))
    .filter((text) => text.trim().length > 0)
    .join(" · ")

  // Odeurs = produits-senteurs frères. On garantit la présence du produit
  // courant et on déduplique par handle.
  const seen = new Set<string>()
  const scents: ScentOption[] = [product, ...siblings]
    .map((p) => ({
      handle: p.handle ?? "",
      label: scentOf(p),
      active: p.handle === product.handle,
    }))
    .filter((s) => {
      if (!s.handle || seen.has(s.handle)) {
        return false
      }
      seen.add(s.handle)
      return true
    })

  return (
    <>
    <section className="bg-ivory">
      <div className="content-container py-10 small:py-14">
        {/* Fil d'Ariane */}
        <nav className="eyebrow text-ink/40">
          <LocalizedClientLink
            href="/collections"
            className="transition-colors hover:text-ink"
          >
            KULT Collection
          </LocalizedClientLink>
          <span className="mx-2 text-ink/30">/</span>
          <span className="text-terracotta">
            {subCategory} {scent}
          </span>
        </nav>

        {/* Bloc principal — flex-row gap 26px, colonnes de hauteur égale
            (les deux sections se terminent à la même ligne) */}
        <div className="mt-8 flex flex-col gap-[26px] small:flex-row small:items-stretch">
          <ProductGallery
            images={piece.images}
            alt={`${subCategory} ${scent}`.trim()}
          />
          <ProductInfo
            subCategory={subCategory}
            scent={scent}
            amount={piece.amount}
            originalAmount={piece.originalAmount}
            onSale={piece.onSale}
            currencyCode={piece.currencyCode}
            isTaxInclusive={piece.isTaxInclusive}
            ambiance={ambiance}
            description={piece.description}
            olfactiveNotes={olfactiveNotes}
            scents={scents}
            variantId={piece.variantId}
          />
        </div>
      </div>
    </section>

      {/* Sections éditoriales — ordre : lot → personnalisation → manifeste → bannière */}
      <ProductLot pieces={lotPieces} />
      {customPiece && <CustomPiece content={customPiece} />}
      <BrandReminder />
      <KultBanner />
    </>
  )
}

export default ProductTemplate
