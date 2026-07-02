import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { setCategoryAmbianceWorkflow } from "../../../../../workflows/ambiance/set-category-ambiance"
import { SetAmbianceSchema } from "../../../ambiances/middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<SetAmbianceSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  await setCategoryAmbianceWorkflow(req.scope).run({
    input: { category_id: id, tag_id: req.validatedBody.tag_id },
  })

  return res.json({ category_id: id, tag_id: req.validatedBody.tag_id })
}
