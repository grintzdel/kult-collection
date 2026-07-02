"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type ProductAmbiance = { value: string; color: string | null }

/**
 * Ambiance effective (libellé + couleur du tag) de chaque produit, résolue côté
 * backend (`GET /store/product-ambiances`) : surcharge produit sinon héritage
 * catégorie. Retombe sur `{}` si la route n'est pas dispo — la carte masque
 * alors simplement son chip.
 */
export const getProductAmbiances = async (
  productIds: string[]
): Promise<Record<string, ProductAmbiance | null>> => {
  if (productIds.length === 0) {
    return {}
  }
  try {
    const next = { ...(await getCacheOptions("product-ambiances")) }
    const data = await sdk.client.fetch<{
      ambiances?: Record<string, ProductAmbiance | null>
    }>("/store/product-ambiances", {
      method: "GET",
      query: { product_ids: productIds.join(",") },
      next,
      cache: "force-cache",
    })
    return data.ambiances ?? {}
  } catch {
    return {}
  }
}
