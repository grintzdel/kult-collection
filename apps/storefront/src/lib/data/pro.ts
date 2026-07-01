import { sdk } from "@lib/config"
import {
  DEFAULT_PRO_CONFIG,
  type ProConfig,
  type ProContextValue,
} from "@modules/pro/types"
import { getAuthHeaders } from "./cookies"

/**
 * Résout le contexte pro côté serveur : la config publique de l'espace pro + le
 * statut isPro du client authentifié (via /store/pro/me). Utilisé dans le layout
 * pour alimenter le ProProvider.
 */
export const getProContext = async (
  countryCode?: string
): Promise<ProContextValue> => {
  const configRes = await sdk.client
    .fetch<{ config: ProConfig }>("/store/pro/config", {
      method: "GET",
      cache: "no-store",
    })
    .catch(() => ({ config: DEFAULT_PRO_CONFIG }))

  const config = configRes.config ?? DEFAULT_PRO_CONFIG

  const authHeaders = await getAuthHeaders()
  let isPro = false

  if ("authorization" in authHeaders) {
    const meRes = await sdk.client
      .fetch<{ is_pro: boolean }>("/store/pro/me", {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      })
      .catch(() => ({ is_pro: false }))

    isPro = Boolean(meRes.is_pro)
  }

  let vatRate = 0
  if (countryCode) {
    const rateRes = await sdk.client
      .fetch<{ rate: number }>(
        `/store/tax-rate?country_code=${countryCode}`,
        { method: "GET", cache: "no-store" }
      )
      .catch(() => ({ rate: 0 }))
    vatRate = Number(rateRes.rate) || 0
  }

  return { isPro, config, vatRate }
}
