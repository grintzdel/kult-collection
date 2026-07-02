import { AmbianceTag, resolveProductAmbiance } from "./resolve-ambiance"

export const CATEGORY_AMBIANCE_METADATA_KEY = "ambiance_tag_id"

type QueryLike = {
  graph: (config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: unknown[] }>
}

/**
 * Résout l'ambiance effective d'un produit : sa surcharge (`product.tags`), sinon
 * l'ambiance héritée de la 1re catégorie qui en définit une
 * (`product_category.metadata.ambiance_tag_id`), hydratée en (id + value).
 */
export const fetchProductAmbiance = async (
  query: QueryLike,
  productId: string
): Promise<AmbianceTag | null> => {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "tags.id", "tags.value", "categories.metadata"],
    filters: { id: productId },
  })

  const product = data[0] as
    | {
        tags?: { id: string; value: string }[]
        categories?: { metadata?: Record<string, unknown> | null }[]
      }
    | undefined

  if (!product) {
    return null
  }

  const productTags: AmbianceTag[] = (product.tags ?? []).map((t) => ({
    id: t.id,
    value: t.value,
  }))

  const inheritedId = (product.categories ?? [])
    .map((c) => c.metadata?.[CATEGORY_AMBIANCE_METADATA_KEY])
    .find((v): v is string => typeof v === "string" && v.length > 0)

  let categoryAmbiance: AmbianceTag | null = null
  if (inheritedId) {
    const { data: tagData } = await query.graph({
      entity: "product_tag",
      fields: ["id", "value"],
      filters: { id: inheritedId },
    })
    const tag = tagData[0] as { id: string; value: string } | undefined
    categoryAmbiance = tag ? { id: tag.id, value: tag.value } : null
  }

  return resolveProductAmbiance(productTags, categoryAmbiance)
}
