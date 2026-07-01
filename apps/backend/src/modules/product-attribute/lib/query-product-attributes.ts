import { AttributeDefinitionInput } from "./resolve-attributes"

type QueryLike = {
  graph: (config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: unknown[] }>
}

const toDefinition = (raw: Record<string, unknown>): AttributeDefinitionInput => ({
  id: raw.id as string,
  key: raw.key as string,
  label: raw.label as string,
  type: raw.type as AttributeDefinitionInput["type"],
  zone: raw.zone as AttributeDefinitionInput["zone"],
  rank: (raw.rank as number) ?? 0,
  group_fields:
    (raw.group_fields as AttributeDefinitionInput["group_fields"]) ?? null,
})

/**
 * Récupère, pour un produit, les définitions applicables (héritées de ses
 * catégories + ajoutées directement) et sa `metadata`. La déduplication et le
 * filtrage `attr_hidden` sont faits par `resolveProductAttributes`.
 */
export const fetchApplicableDefinitions = async (
  query: QueryLike,
  productId: string
): Promise<{
  definitions: AttributeDefinitionInput[]
  metadata: Record<string, unknown> | null
}> => {
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "metadata",
      "attribute_definitions.*",
      "categories.attribute_definitions.*",
    ],
    filters: { id: productId },
  })

  const product = data[0] as
    | {
        metadata?: Record<string, unknown> | null
        attribute_definitions?: Record<string, unknown>[]
        categories?: { attribute_definitions?: Record<string, unknown>[] }[]
      }
    | undefined

  if (!product) {
    return { definitions: [], metadata: null }
  }

  const fromProduct = product.attribute_definitions ?? []
  const fromCategories = (product.categories ?? []).flatMap(
    (c) => c.attribute_definitions ?? []
  )

  return {
    definitions: [...fromProduct, ...fromCategories].map(toDefinition),
    metadata: product.metadata ?? null,
  }
}
