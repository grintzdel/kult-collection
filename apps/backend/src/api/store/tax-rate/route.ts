import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Renvoie le taux de TVA par défaut (en %) pour un pays donné.
 * Sert au storefront à calculer un affichage TTC (le calculated_price des
 * produits est net/HT ; la taxe Medusa ne s'applique qu'au panier).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const countryCode = String(req.query.country_code || "").toLowerCase()
  if (!countryCode) {
    return res.json({ rate: 0 })
  }

  const tax = req.scope.resolve(Modules.TAX)

  const regions = await tax.listTaxRegions(
    { country_code: countryCode },
    { take: 1 }
  )
  const region = regions[0]
  if (!region) {
    return res.json({ rate: 0 })
  }

  const rates = await tax.listTaxRates(
    { tax_region_id: region.id },
    { take: 50 }
  )
  const def = rates.find((r) => r.is_default) ?? rates[0]

  return res.json({ rate: def?.rate ? Number(def.rate) : 0 })
}
