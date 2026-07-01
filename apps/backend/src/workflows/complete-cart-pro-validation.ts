import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import {
  PRO_CUSTOMER_GROUP_NAME,
  PRO_SPACE_MODULE,
} from "../modules/pro-space"

/**
 * Enforcement serveur de l'espace pro au moment du checkout.
 *
 * Ce hook `validate` de completeCartWorkflow s'exécute avant toute opération de
 * création de commande. Il ne s'applique qu'aux clients du groupe « Pros ».
 *
 * - Si l'espace pro est actif mais que l'achat en ligne est désactivé
 *   (mode contact/devis) → le checkout pro est bloqué.
 * - Si l'achat en ligne est activé mais que le total HT des articles est
 *   sous le minimum de commande → le checkout est bloqué.
 *
 * Les clients B2C ne sont jamais affectés.
 */
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const groups: Array<{ name?: string }> = cart?.customer?.groups ?? []
  const isPro = groups.some((group) => group?.name === PRO_CUSTOMER_GROUP_NAME)

  if (!isPro) {
    return
  }

  const proService = container.resolve(PRO_SPACE_MODULE)
  const [config] = await proService.listProConfigs({}, { take: 1 })

  if (!config || !config.active) {
    return
  }

  if (!config.online_purchase_enabled) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "L'achat en ligne pro est désactivé. Contactez-nous pour obtenir un devis."
    )
  }

  const itemsHt: number = cart?.item_subtotal ?? cart?.subtotal ?? 0

  if (config.min_order_amount && itemsHt < config.min_order_amount) {
    const currency = String(config.currency_code || "eur").toUpperCase()
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Minimum de commande pro non atteint : ${config.min_order_amount} ${currency} HT requis.`
    )
  }
})
