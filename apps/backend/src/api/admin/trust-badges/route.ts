import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createTrustBadgeWorkflow } from "../../../workflows/product-attribute/manage-trust-badges"
import { CreateTrustBadgeSchema } from "../product-attributes/middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: trust_badges } = await query.graph({
    entity: "trust_badge",
    fields: ["id", "icon", "label", "rank"],
  })

  trust_badges.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  return res.json({ trust_badges })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateTrustBadgeSchema>,
  res: MedusaResponse
) {
  const { result } = await createTrustBadgeWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.status(201).json({ trust_badge: result })
}
