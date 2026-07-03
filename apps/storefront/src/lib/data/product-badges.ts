"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type BadgePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"

export type ProductBadge = {
  type: "featured" | "new"
  label: string
  image_url: string | null
  position: BadgePosition
}

/** Config globale des badges d'indication, indexée par type. */
export type ProductBadges = {
  featured: ProductBadge | null
  new: ProductBadge | null
}

const EMPTY: ProductBadges = { featured: null, new: null }

/**
 * Badges d'indication globaux (« produit phare » / « nouveau produit »),
 * configurés côté admin : image + coin d'affichage. Résolus via
 * `GET /store/product-badges`. Retombe sur `{}` si la route/les images ne sont
 * pas dispo — la carte n'affiche alors aucun badge.
 */
export const getProductBadges = async (): Promise<ProductBadges> => {
  try {
    const next = { ...(await getCacheOptions("product-badges")) }
    const data = await sdk.client.fetch<{ product_badges?: ProductBadge[] }>(
      "/store/product-badges",
      {
        method: "GET",
        next,
        cache: "force-cache",
      }
    )
    const badges = data.product_badges ?? []
    return {
      featured: badges.find((b) => b.type === "featured") ?? null,
      new: badges.find((b) => b.type === "new") ?? null,
    }
  } catch {
    return EMPTY
  }
}
