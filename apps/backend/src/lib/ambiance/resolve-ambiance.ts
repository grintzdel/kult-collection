export type AmbianceTag = { id: string; value: string; color: string | null }

/**
 * Ambiance effective d'un produit : sa surcharge (1er tag natif) gagne ; sinon
 * l'ambiance héritée de sa catégorie ; sinon null. La couleur (issue de
 * `tag.metadata.color`) suit le tag retenu.
 *
 * @param productTags tags natifs du produit (`product.tags`), avec leur couleur
 * @param categoryAmbiance ambiance de la catégorie, déjà hydratée (id + value + color)
 */
export const resolveProductAmbiance = (
  productTags: AmbianceTag[] | null | undefined,
  categoryAmbiance: AmbianceTag | null | undefined
): AmbianceTag | null => {
  const override = productTags?.[0]
  if (override) {
    return { id: override.id, value: override.value, color: override.color }
  }
  return categoryAmbiance ?? null
}
