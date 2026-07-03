import { HttpTypes } from "@medusajs/types"

/**
 * Contenu éditorial de la section « pièce personnalisée », rattaché à une
 * CATÉGORIE côté backend (`category.metadata.custom_piece`). Miroir du type seed
 * `apps/backend/src/lib/seed/apply-custom-piece.ts`.
 */
export type CustomPieceContent = {
  enabled: boolean
  kicker: string
  title: string
  text: string
  cta_label: string
  cta_url: string
  image: string
}

const isCustomPiece = (value: unknown): value is CustomPieceContent => {
  if (!value || typeof value !== "object") {
    return false
  }
  const cp = value as Record<string, unknown>
  return (
    cp.enabled === true &&
    typeof cp.title === "string" &&
    typeof cp.text === "string" &&
    typeof cp.image === "string"
  )
}

/**
 * Résout la section « pièce personnalisée » d'un produit depuis la metadata de
 * ses catégories. Retourne la première catégorie qui en porte une (activée),
 * sinon `null` — la section est alors masquée.
 */
export const pickCustomPiece = (
  product: HttpTypes.StoreProduct
): CustomPieceContent | null => {
  for (const category of product.categories ?? []) {
    const candidate = (category.metadata as Record<string, unknown> | null)
      ?.custom_piece
    if (isCustomPiece(candidate)) {
      return candidate
    }
  }
  return null
}
