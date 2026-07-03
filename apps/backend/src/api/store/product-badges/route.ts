import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Badges d'indication globaux (produit phare / nouveau produit) exposés au
 * storefront. L'image transmet l'indication ; le storefront l'affiche sur les
 * produits dont `metadata.is_featured` / `metadata.is_new` est vrai.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: product_badges } = await query.graph({
    entity: "product_badge",
    fields: ["type", "label", "image_url", "position"],
  })

  return res.json({ product_badges })
}
