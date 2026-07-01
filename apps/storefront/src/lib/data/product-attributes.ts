"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreAttribute = {
  key: string
  label: string
  type: "text" | "textarea" | "group"
  zone: "accroche" | "specs" | "accordeon"
  rank: number
  group_fields?: { key: string; label: string }[] | null
  value: string | Record<string, string> | null
}

export type StoreTrustBadge = {
  id: string
  icon: string
  label: string
  rank: number
}

/**
 * Attributs éditoriaux résolus d'un produit (uniquement ceux ayant une valeur),
 * scoping catégorie + overrides produit gérés côté backend.
 */
export const getProductAttributes = async (
  productId: string
): Promise<StoreAttribute[]> => {
  const next = { ...(await getCacheOptions("product-attributes")) }
  try {
    const { attributes } = await sdk.client.fetch<{ attributes: StoreAttribute[] }>(
      `/store/products/${productId}/attributes`,
      { method: "GET", next, cache: "force-cache" }
    )
    return attributes ?? []
  } catch {
    return []
  }
}

/** Bandeau de réassurance global (toutes fiches produit), ordonné. */
export const getTrustBadges = async (): Promise<StoreTrustBadge[]> => {
  const next = { ...(await getCacheOptions("trust-badges")) }
  try {
    const { trust_badges } = await sdk.client.fetch<{
      trust_badges: StoreTrustBadge[]
    }>(`/store/trust-badges`, { method: "GET", next, cache: "force-cache" })
    return trust_badges ?? []
  } catch {
    return []
  }
}
