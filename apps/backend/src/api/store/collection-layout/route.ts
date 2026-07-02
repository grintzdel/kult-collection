import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const DEFAULT_LAYOUT = { pattern: [1, 4, 3], repeat: true }

/**
 * Expose le layout de la page Collection (nombre de produits par ligne) tel que
 * configuré dans `store.metadata.collection_layout`. Retombe sur 1 / 4 / 3.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["metadata"],
  })

  const raw = (stores[0]?.metadata ?? {}) as Record<string, unknown>
  const configured = raw.collection_layout as
    | { pattern?: unknown; repeat?: unknown }
    | undefined

  const pattern = Array.isArray(configured?.pattern)
    ? configured!.pattern.filter(
        (n): n is number => typeof n === "number" && n > 0
      )
    : []

  res.json(
    pattern.length > 0
      ? { pattern, repeat: configured?.repeat !== false }
      : DEFAULT_LAYOUT
  )
}
