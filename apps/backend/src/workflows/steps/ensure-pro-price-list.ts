import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { PRO_CUSTOMER_GROUP_NAME } from "../../modules/pro-space"

export const PRO_PRICE_LIST_TITLE = "Tarif Pro"

export type EnsureProPriceListInput = {
  variant_id: string
}

/**
 * Garantit l'existence du groupe « Pros » et de la price list « Tarif Pro »
 * (scopée au groupe), et retourne les ids des prix pro existants pour le variant
 * (à remplacer). La règle de scoping est `customer.groups.id`.
 */
export const ensureProPriceListStep = createStep(
  "ensure-pro-price-list",
  async ({ variant_id }: EnsureProPriceListInput, { container }) => {
    const customer = container.resolve(Modules.CUSTOMER)
    const pricing = container.resolve(Modules.PRICING)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    let [group] = await customer.listCustomerGroups(
      { name: PRO_CUSTOMER_GROUP_NAME },
      { take: 1 }
    )
    if (!group) {
      const [created] = await customer.createCustomerGroups([
        { name: PRO_CUSTOMER_GROUP_NAME },
      ])
      group = created
    }

    const priceLists = await pricing.listPriceLists({}, { take: 200 })
    let priceList = priceLists.find((p) => p.title === PRO_PRICE_LIST_TITLE)
    let createdList = false
    if (!priceList) {
      const [created] = await pricing.createPriceLists([
        {
          title: PRO_PRICE_LIST_TITLE,
          description: "Tarifs de gros réservés au groupe Pros",
          status: "active",
          rules: { "customer.groups.id": [group.id] },
        },
      ])
      priceList = created
      createdList = true
    }

    const { data } = await query.graph({
      entity: "variant",
      fields: ["id", "price_set.id"],
      filters: { id: variant_id },
    })
    const priceSetId = data?.[0]?.price_set?.id

    let existingPriceIds: string[] = []
    if (priceSetId) {
      const prices = await pricing.listPrices(
        { price_list_id: [priceList.id], price_set_id: [priceSetId] },
        { take: 100 }
      )
      existingPriceIds = prices.map((p) => p.id)
    }

    return new StepResponse(
      { priceListId: priceList.id, existingPriceIds },
      { createdList, priceListId: priceList.id }
    )
  },
  async (comp, { container }) => {
    // On ne supprime la price list en compensation que si on vient de la créer.
    if (comp?.createdList) {
      const pricing = container.resolve(Modules.PRICING)
      await pricing.deletePriceLists([comp.priceListId]).catch(() => {})
    }
  }
)
