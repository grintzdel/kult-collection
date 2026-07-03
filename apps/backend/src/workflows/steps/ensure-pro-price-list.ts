import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { PRO_CUSTOMER_GROUP_NAME } from "../../modules/pro-space"

export const PRO_PRICE_LIST_TITLE = "Tarif Pro"

export type EnsureProPriceListInput = {
  variant_id: string
  currency_code: string
}

/**
 * Garantit l'existence du groupe « Pros » et de la price list « Tarif Pro »
 * (scopée au groupe, type `sale` pour que le storefront reçoive `original_amount`
 * + `price_list_type: "sale"` et affiche le prix barré), et retourne les ids des
 * prix pro existants pour le variant (à remplacer) ainsi que le prix de base du
 * variant pour la devise (nécessaire au calcul de la réduction en %).
 * La règle de scoping est `customer.groups.id`.
 */
export const ensureProPriceListStep = createStep(
  "ensure-pro-price-list",
  async ({ variant_id, currency_code }: EnsureProPriceListInput, { container }) => {
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
          type: "sale",
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
    let baseAmount = 0
    if (priceSetId) {
      const existing = await pricing.listPrices(
        { price_list_id: [priceList.id], price_set_id: [priceSetId] },
        { take: 100 }
      )
      existingPriceIds = existing.map((p) => p.id)

      // Prix de base du variant : hors price list, sans palier de quantité.
      const setPrices = await pricing.listPrices(
        { price_set_id: [priceSetId], currency_code: [currency_code] },
        { take: 200, relations: ["price_list"] }
      )
      const base = setPrices.find((p) => !p.price_list && p.min_quantity == null)
      baseAmount = base ? Number(base.amount) : 0
    }

    return new StepResponse(
      { priceListId: priceList.id, existingPriceIds, baseAmount },
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
