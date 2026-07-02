import { HttpTypes } from "@medusajs/types"
import { productTypeKey } from "@modules/collections/lib/to-card-model"

/**
 * Catégorie « feuille » d'un produit. Quand les catégories sont imbriquées et
 * que le produit est rattaché à la fois au parent et à l'enfant (ex. « Vaisselle »
 * ET « Assiette »), on veut l'ENFANT pour scoper les frères sur la sous-catégorie,
 * pas sur toute la catégorie parente.
 *
 * Détection dynamique (aucun nom en dur) : une catégorie est écartée si elle est
 * le parent d'une autre catégorie présente dans la liste. Repli : la première
 * catégorie (aucune imbrication détectée) sinon `undefined`.
 */
export const pickLeafCategory = (
  categories?: HttpTypes.StoreProductCategory[] | null
): HttpTypes.StoreProductCategory | undefined => {
  if (!categories?.length) {
    return undefined
  }
  const parentIds = new Set(
    categories
      .map((c) => c.parent_category_id)
      .filter((id): id is string => Boolean(id))
  )
  return categories.find((c) => !parentIds.has(c.id)) ?? categories[0]
}

export const pickLeafCategoryId = (
  categories?: HttpTypes.StoreProductCategory[] | null
): string | undefined => pickLeafCategory(categories)?.id

/**
 * Frères « même modèle » : autres produits du MÊME TYPE que le produit courant
 * (même `productTypeKey`, ex. les autres assiettes), le produit courant exclu.
 * Aligne la page produit sur le « N autres modèles » de la carte Collection, qui
 * regroupe elle aussi par type de titre — et non sur toute la catégorie.
 */
export const sameTypeSiblings = (
  product: HttpTypes.StoreProduct,
  candidates: HttpTypes.StoreProduct[]
): HttpTypes.StoreProduct[] => {
  const typeKey = productTypeKey(product.title ?? "")
  return candidates.filter(
    (p) => p.handle !== product.handle && productTypeKey(p.title ?? "") === typeKey
  )
}
