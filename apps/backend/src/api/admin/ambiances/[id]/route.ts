import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteProductTagsWorkflow,
  updateProductTagsWorkflow,
} from "@medusajs/medusa/core-flows"
import { UpdateAmbianceSchema } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateAmbianceSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { result } = await updateProductTagsWorkflow(req.scope).run({
    input: {
      selector: { id },
      update: { value: req.validatedBody.value },
    },
  })

  return res.json({ ambiance: result[0] })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  await deleteProductTagsWorkflow(req.scope).run({ input: { ids: [id] } })

  return res.json({ id, object: "ambiance", deleted: true })
}
