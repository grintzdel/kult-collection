import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { fetchProductAmbiance } from "../../../../../lib/ambiance/query-ambiance"
import { setProductAmbianceWorkflow } from "../../../../../workflows/ambiance/set-product-ambiance"
import { SetAmbianceSchema } from "../../../ambiances/middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const ambiance = await fetchProductAmbiance(query, req.params.id)
  return res.json({ ambiance })
}

export async function POST(
  req: AuthenticatedMedusaRequest<SetAmbianceSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  await setProductAmbianceWorkflow(req.scope).run({
    input: { product_id: id, tag_id: req.validatedBody.tag_id },
  })

  return res.json({ product_id: id, tag_id: req.validatedBody.tag_id })
}
