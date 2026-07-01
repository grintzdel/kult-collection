import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRO_CUSTOMER_GROUP_NAME } from "../../../../modules/pro-space"

/**
 * Indique si le client authentifié appartient au groupe « Pros ».
 * Évite d'exposer publiquement les customer groups au storefront.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "groups.name"],
    filters: { id: customerId },
  })

  const groups = data?.[0]?.groups ?? []
  const is_pro = groups.some(
    (group) => group?.name === PRO_CUSTOMER_GROUP_NAME
  )

  return res.json({ is_pro })
}
