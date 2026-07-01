import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { setProductDefinitionLinksWorkflow } from "../../../../../../workflows/product-attribute/set-product-definition-links"
import { SetProductLinksSchema } from "../../../../product-attributes/middlewares"

/**
 * Override produit : ajoute / retire des définitions sur ce produit précis.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<SetProductLinksSchema>,
  res: MedusaResponse
) {
  const { result } = await setProductDefinitionLinksWorkflow(req.scope).run({
    input: { product_id: req.params.id, ...req.validatedBody },
  })

  return res.json({ result })
}
