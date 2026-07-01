import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/** Bandeau de réassurance global (toutes fiches produit), ordonné. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: trust_badges } = await query.graph({
    entity: "trust_badge",
    fields: ["id", "icon", "label", "rank"],
  })

  trust_badges.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  return res.json({ trust_badges })
}
