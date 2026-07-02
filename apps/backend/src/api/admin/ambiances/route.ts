import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductTagsWorkflow } from "@medusajs/medusa/core-flows"
import { CreateAmbianceSchema } from "./middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: tags } = await query.graph({
    entity: "product_tag",
    fields: ["id", "value", "metadata", "products.id"],
  })

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "metadata"],
  })

  const categoryCountByTag = new Map<string, number>()
  for (const c of categories as { metadata?: Record<string, unknown> | null }[]) {
    const tagId = c.metadata?.ambiance_tag_id
    if (typeof tagId === "string") {
      categoryCountByTag.set(tagId, (categoryCountByTag.get(tagId) ?? 0) + 1)
    }
  }

  const ambiances = (
    tags as {
      id: string
      value: string
      metadata?: Record<string, unknown> | null
      products?: unknown[]
    }[]
  ).map((t) => ({
    id: t.id,
    value: t.value,
    color: typeof t.metadata?.color === "string" ? t.metadata.color : null,
    product_count: t.products?.length ?? 0,
    category_count: categoryCountByTag.get(t.id) ?? 0,
  }))

  return res.json({ ambiances })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateAmbianceSchema>,
  res: MedusaResponse
) {
  const { value, color } = req.validatedBody
  const { result } = await createProductTagsWorkflow(req.scope).run({
    input: {
      product_tags: [{ value, ...(color ? { metadata: { color } } : {}) }],
    },
  })

  return res.status(201).json({ ambiance: result[0] })
}
