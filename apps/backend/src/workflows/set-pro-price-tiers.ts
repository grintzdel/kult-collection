import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPriceListPricesWorkflow,
  removePriceListPricesWorkflow,
} from "@medusajs/medusa/core-flows"
import { ensureProPriceListStep } from "./steps/ensure-pro-price-list"

export type ProPriceTier = {
  min_quantity: number
  max_quantity?: number | null
  amount: number
}

export type SetProPriceTiersInput = {
  variant_id: string
  currency_code: string
  tiers: ProPriceTier[]
}

/**
 * Remplace les paliers de prix pro d'un variant.
 *
 * On supprime d'abord les prix pro existants du variant, PUIS on crée les
 * nouveaux paliers — dans cet ordre garanti (la création dépend du résultat de
 * la suppression). Faire delete+create dans un même batch provoque une collision
 * de clé unique quand un palier réutilise le même `min_quantity`.
 */
export const setProPriceTiersWorkflow = createWorkflow(
  "set-pro-price-tiers",
  function (input: SetProPriceTiersInput) {
    const prep = ensureProPriceListStep(input)

    const removed = removePriceListPricesWorkflow.runAsStep({
      input: transform({ prep }, ({ prep }) => ({
        ids: prep.existingPriceIds,
      })),
    })

    // `removed` est inclus dans les dépendances du transform pour forcer la
    // création APRÈS la suppression (ordre garanti).
    const createInput = transform(
      { prep, input, removed },
      ({ prep, input }) => ({
        data: [
          {
            id: prep.priceListId,
            prices: input.tiers.map((tier) => ({
              amount: tier.amount,
              currency_code: input.currency_code,
              variant_id: input.variant_id,
              min_quantity: tier.min_quantity,
              max_quantity: tier.max_quantity ?? null,
            })),
          },
        ],
      })
    )

    createPriceListPricesWorkflow.runAsStep({ input: createInput })

    return new WorkflowResponse({ priceListId: prep.priceListId })
  }
)

export default setProPriceTiersWorkflow
