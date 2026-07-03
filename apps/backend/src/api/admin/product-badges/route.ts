import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { upsertProductBadgeWorkflow } from "../../../workflows/product-attribute/manage-product-badges"
import { UpsertProductBadgeSchema } from "../product-attributes/middlewares"

/** Liste les deux badges globaux (produit phare / nouveau produit). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: product_badges } = await query.graph({
    entity: "product_badge",
    fields: ["id", "type", "label", "image_url", "position"],
  })

  return res.json({ product_badges })
}

/** Upsert d'un badge par type : met à jour son libellé et/ou son image. */
export async function POST(
  req: AuthenticatedMedusaRequest<UpsertProductBadgeSchema>,
  res: MedusaResponse
) {
  const { result } = await upsertProductBadgeWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.status(200).json({ product_badge: result })
}
