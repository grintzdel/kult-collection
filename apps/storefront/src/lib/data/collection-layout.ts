"use server"

import { sdk } from "@lib/config"
import {
  DEFAULT_PATTERN,
  type LayoutPattern,
} from "@modules/collections/lib/chunk-by-pattern"
import { getCacheOptions } from "./cookies"

/**
 * Lit le pattern de layout de la page Collection depuis le backend
 * (`store.metadata.collection_layout`, exposé par `GET /store/collection-layout`).
 * Retombe sur {@link DEFAULT_PATTERN} (1 / 4 / 3) si la route n'est pas dispo.
 */
export const getCollectionLayout = async (): Promise<LayoutPattern> => {
  try {
    const next = { ...(await getCacheOptions("collection-layout")) }
    const data = await sdk.client.fetch<{ pattern?: number[]; repeat?: boolean }>(
      "/store/collection-layout",
      { method: "GET", next, cache: "force-cache" }
    )
    const pattern = Array.isArray(data.pattern)
      ? data.pattern.filter((n) => Number.isFinite(n) && n > 0)
      : []
    if (pattern.length === 0) {
      return DEFAULT_PATTERN
    }
    return { pattern, repeat: data.repeat !== false }
  } catch {
    return DEFAULT_PATTERN
  }
}
