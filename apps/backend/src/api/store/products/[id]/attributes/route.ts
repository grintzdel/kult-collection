import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { fetchApplicableDefinitions } from "../../../../../modules/product-attribute/lib/query-product-attributes"
import {
  resolveProductAttributes,
  withValuesOnly,
} from "../../../../../modules/product-attribute/lib/resolve-attributes"

/**
 * Attributs affichables d'un produit (uniquement ceux ayant une valeur), pour le
 * storefront. Résolus côté serveur : scoping catégorie + ajouts/masquages produit.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { definitions, metadata } = await fetchApplicableDefinitions(
    query,
    req.params.id
  )
  const attributes = withValuesOnly(
    resolveProductAttributes(definitions, metadata)
  )

  return res.json({ attributes })
}
