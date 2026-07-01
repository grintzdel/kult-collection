import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAttributeDefinitionWorkflow } from "../../../workflows/product-attribute/create-attribute-definition"
import { CreateAttributeDefinitionSchema } from "./middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: attribute_definitions } = await query.graph({
    entity: "attribute_definition",
    fields: [
      "id",
      "key",
      "label",
      "type",
      "zone",
      "rank",
      "group_fields",
      "product_categories.id",
      "product_categories.name",
    ],
  })

  return res.json({ attribute_definitions })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateAttributeDefinitionSchema>,
  res: MedusaResponse
) {
  const { result } = await createAttributeDefinitionWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.status(201).json({ attribute_definition: result })
}
