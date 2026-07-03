import type { ProConfig } from "@modules/pro/types"

/**
 * Contexte de prix pro nécessaire pour ajuster l'affichage d'un montant.
 * `vatRate` est exprimé en pourcentage (ex: 20 pour 20 %).
 */
export type ProPricing = {
  isPro: boolean
  config: ProConfig
  vatRate: number
}

export type ResolvedProPrice = {
  /** montant à afficher (net HT ou TTC selon la config pro) */
  value: number
  /** suffixe d'affichage : "" (B2C), "HT" ou "TTC" (pro actif) */
  suffix: string
}

/**
 * Résout le montant et le suffixe d'un prix selon le contexte pro.
 *
 * - Client B2C (ou espace pro inactif) : montant inchangé, aucun suffixe.
 * - Client pro (espace actif) : le toggle admin `display_ht` bascule l'affichage
 *   entre HT (net) et TTC (net × (1 + TVA)). La différence n'est visible que si
 *   une TVA est configurée pour le pays (sinon HT = TTC).
 *
 * Source unique de vérité partagée entre la fiche produit et les cartes collection.
 */
export const resolveProPrice = (
  amount: number,
  isTaxInclusive: boolean,
  { isPro, config, vatRate }: ProPricing
): ResolvedProPrice => {
  const rate = vatRate / 100
  const net = isTaxInclusive ? amount / (1 + rate) : amount
  const ttc = isTaxInclusive ? amount : amount * (1 + rate)

  const proActive = isPro && config.active
  const value = proActive && !config.display_ht ? ttc : proActive ? net : amount
  const suffix = proActive ? (config.display_ht ? "HT" : "TTC") : ""

  return { value, suffix }
}
