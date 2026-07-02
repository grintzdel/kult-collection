import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { fetchProductsAmbiances } from "../../../lib/ambiance/query-ambiance"

/**
 * Ambiance effective (value + couleur) d'un ensemble de produits, résolue côté
 * serveur (surcharge produit sinon héritage catégorie). Les metadata des tags /
 * catégories n'étant pas exposées sur l'API store, la résolution passe par le
 * query container.
 *
 * `GET /store/product-ambiances?product_ids=a,b,c`
 * → `{ ambiances: { [id]: { value, color } | null } }`
 */
const parseIds = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string")
  }
  if (typeof raw === "string") {
    return raw.split(",").map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const ids = parseIds(req.query.product_ids)

  const resolved = await fetchProductsAmbiances(query, ids)

  const ambiances: Record<string, { value: string; color: string | null } | null> =
    {}
  for (const [id, tag] of Object.entries(resolved)) {
    ambiances[id] = tag ? { value: tag.value, color: tag.color } : null
  }

  res.json({ ambiances })
}
