import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { PRO_PRICE_LIST_TITLE } from "../../../../workflows/steps/ensure-pro-price-list"
import { setProPriceTiersWorkflow } from "../../../../workflows/set-pro-price-tiers"
import type { SetProPriceTiersSchema } from "../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const variantId = req.query.variant_id as string
  if (!variantId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "variant_id est requis"
    )
  }

  const pricing = req.scope.resolve(Modules.PRICING)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const priceLists = await pricing.listPriceLists({}, { take: 200 })
  const priceList = priceLists.find((p) => p.title === PRO_PRICE_LIST_TITLE)
  if (!priceList) {
    return res.json({ tiers: [], price_list_id: null })
  }

  const { data } = await query.graph({
    entity: "variant",
    fields: ["id", "price_set.id"],
    filters: { id: variantId },
  })
  const priceSetId = data?.[0]?.price_set?.id
  if (!priceSetId) {
    return res.json({ tiers: [], price_list_id: priceList.id })
  }

  const proPrices = await pricing.listPrices(
    { price_list_id: [priceList.id], price_set_id: [priceSetId] },
    { take: 100 }
  )

  // Prix de base par devise (hors price list, sans palier) pour reconstruire le %.
  const setPrices = await pricing.listPrices(
    { price_set_id: [priceSetId] },
    { take: 200, relations: ["price_list"] }
  )
  const baseAmountFor = (currency: string | undefined): number => {
    const base = setPrices.find(
      (p) =>
        !p.price_list && p.currency_code === currency && p.min_quantity == null
    )
    return base ? Number(base.amount) : 0
  }

  const tiers = proPrices
    .map((p) => {
      const amount = Number(p.amount)
      const base = baseAmountFor(p.currency_code)
      const discount_percent =
        base > 0 ? Math.round((1 - amount / base) * 100) : 0
      return {
        id: p.id,
        discount_percent,
        currency_code: p.currency_code,
        min_quantity: p.min_quantity ? Number(p.min_quantity) : 1,
        max_quantity: p.max_quantity ? Number(p.max_quantity) : null,
      }
    })
    .sort((a, b) => a.min_quantity - b.min_quantity)

  return res.json({ tiers, price_list_id: priceList.id })
}

export async function POST(
  req: AuthenticatedMedusaRequest<SetProPriceTiersSchema>,
  res: MedusaResponse
) {
  const { result } = await setProPriceTiersWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json({ price_list_id: result.priceListId })
}
