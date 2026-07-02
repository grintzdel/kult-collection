import { AmbianceTag, resolveProductAmbiance } from "./resolve-ambiance"

export const CATEGORY_AMBIANCE_METADATA_KEY = "ambiance_tag_id"

type QueryLike = {
  graph: (config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: unknown[] }>
}

type RawTag = { id: string; value: string; metadata?: Record<string, unknown> | null }
type RawProduct = {
  id: string
  tags?: RawTag[]
  categories?: { metadata?: Record<string, unknown> | null }[]
}

const readColor = (metadata?: Record<string, unknown> | null): string | null =>
  typeof metadata?.color === "string" ? metadata.color : null

const toAmbianceTag = (tag: RawTag): AmbianceTag => ({
  id: tag.id,
  value: tag.value,
  color: readColor(tag.metadata),
})

const inheritedTagId = (product: RawProduct): string | undefined =>
  (product.categories ?? [])
    .map((c) => c.metadata?.[CATEGORY_AMBIANCE_METADATA_KEY])
    .find((v): v is string => typeof v === "string" && v.length > 0)

const PRODUCT_FIELDS = [
  "id",
  "tags.id",
  "tags.value",
  "tags.metadata",
  "categories.metadata",
]

/**
 * Résout l'ambiance effective d'un produit : sa surcharge (`product.tags`), sinon
 * l'ambiance héritée de la 1re catégorie qui en définit une
 * (`product_category.metadata.ambiance_tag_id`), hydratée en (id + value + color).
 */
export const fetchProductAmbiance = async (
  query: QueryLike,
  productId: string
): Promise<AmbianceTag | null> => {
  const { data } = await query.graph({
    entity: "product",
    fields: PRODUCT_FIELDS,
    filters: { id: productId },
  })

  const product = data[0] as RawProduct | undefined
  if (!product) {
    return null
  }

  const productTags = (product.tags ?? []).map(toAmbianceTag)

  const inheritedId = inheritedTagId(product)
  let categoryAmbiance: AmbianceTag | null = null
  if (inheritedId) {
    const { data: tagData } = await query.graph({
      entity: "product_tag",
      fields: ["id", "value", "metadata"],
      filters: { id: inheritedId },
    })
    const tag = tagData[0] as RawTag | undefined
    categoryAmbiance = tag ? toAmbianceTag(tag) : null
  }

  return resolveProductAmbiance(productTags, categoryAmbiance)
}

/**
 * Version batch : résout l'ambiance effective d'un ensemble de produits en 2
 * requêtes au plus (une sur `product`, une pour hydrater les tags hérités).
 * Retourne une map `productId -> ambiance | null`.
 */
export const fetchProductsAmbiances = async (
  query: QueryLike,
  productIds: string[]
): Promise<Record<string, AmbianceTag | null>> => {
  if (productIds.length === 0) {
    return {}
  }

  const { data } = await query.graph({
    entity: "product",
    fields: PRODUCT_FIELDS,
    filters: { id: productIds },
  })
  const products = data as RawProduct[]

  const inheritedIds = [
    ...new Set(
      products.map(inheritedTagId).filter((v): v is string => typeof v === "string")
    ),
  ]

  const inheritedById = new Map<string, AmbianceTag>()
  if (inheritedIds.length > 0) {
    const { data: tagData } = await query.graph({
      entity: "product_tag",
      fields: ["id", "value", "metadata"],
      filters: { id: inheritedIds },
    })
    for (const tag of tagData as RawTag[]) {
      inheritedById.set(tag.id, toAmbianceTag(tag))
    }
  }

  const result: Record<string, AmbianceTag | null> = {}
  for (const product of products) {
    const productTags = (product.tags ?? []).map(toAmbianceTag)
    const inheritedId = inheritedTagId(product)
    const categoryAmbiance = inheritedId
      ? inheritedById.get(inheritedId) ?? null
      : null
    result[product.id] = resolveProductAmbiance(productTags, categoryAmbiance)
  }

  return result
}
