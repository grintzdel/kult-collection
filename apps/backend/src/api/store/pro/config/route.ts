import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRO_SPACE_MODULE } from "../../../../modules/pro-space"

/**
 * Config pro exposée publiquement au storefront (champs sûrs uniquement).
 * Si aucune config n'existe encore, on renvoie des valeurs par défaut « espace pro éteint ».
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const proService = req.scope.resolve(PRO_SPACE_MODULE)
  const [config] = await proService.listProConfigs({}, { take: 1 })

  return res.json({
    config: {
      active: config?.active ?? false,
      online_purchase_enabled: config?.online_purchase_enabled ?? false,
      min_order_amount: config?.min_order_amount ?? 0,
      currency_code: config?.currency_code ?? "eur",
      display_ht: config?.display_ht ?? true,
    },
  })
}
