import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { fetchApplicableDefinitions } from "../../../../../modules/product-attribute/lib/query-product-attributes"
import { resolveProductAttributes } from "../../../../../modules/product-attribute/lib/resolve-attributes"

/**
 * Champs applicables au produit (hérités catégories + ajouts), avec valeurs —
 * y compris vides, pour l'édition dans le widget admin.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { definitions, metadata } = await fetchApplicableDefinitions(
    query,
    req.params.id
  )
  const attributes = resolveProductAttributes(definitions, metadata)

  return res.json({ attributes })
}
