export type AmbianceTag = { id: string; value: string }

/**
 * Ambiance effective d'un produit : sa surcharge (1er tag natif) gagne ; sinon
 * l'ambiance héritée de sa catégorie ; sinon null.
 *
 * @param productTags tags natifs du produit (`product.tags`)
 * @param categoryAmbiance ambiance de la catégorie, déjà hydratée (id + value)
 */
export const resolveProductAmbiance = (
  productTags: AmbianceTag[] | null | undefined,
  categoryAmbiance: AmbianceTag | null | undefined
): AmbianceTag | null => {
  const override = productTags?.[0]
  if (override) {
    return { id: override.id, value: override.value }
  }
  return categoryAmbiance ?? null
}
