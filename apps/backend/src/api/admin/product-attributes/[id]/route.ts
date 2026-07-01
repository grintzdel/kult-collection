import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteAttributeDefinitionWorkflow } from "../../../../workflows/product-attribute/delete-attribute-definition"
import { updateAttributeDefinitionWorkflow } from "../../../../workflows/product-attribute/update-attribute-definition"
import { UpdateAttributeDefinitionSchema } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateAttributeDefinitionSchema>,
  res: MedusaResponse
) {
  const { result } = await updateAttributeDefinitionWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })

  return res.json({ attribute_definition: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  await deleteAttributeDefinitionWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  return res.json({ id: req.params.id, object: "attribute_definition", deleted: true })
}
