import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteTrustBadgeWorkflow,
  updateTrustBadgeWorkflow,
} from "../../../../workflows/product-attribute/manage-trust-badges"
import { UpdateTrustBadgeSchema } from "../../product-attributes/middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateTrustBadgeSchema>,
  res: MedusaResponse
) {
  const { result } = await updateTrustBadgeWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })

  return res.json({ trust_badge: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await deleteTrustBadgeWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  return res.json({ id: req.params.id, object: "trust_badge", deleted: true })
}
