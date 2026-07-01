"use client"

import { usePro } from "@modules/pro/context/pro-provider"
import { formatPrice } from "./pieces"

/**
 * Prix produit KULT.
 * - Client B2C : affichage inchangé (montant net).
 * - Client pro (espace actif) : le toggle admin `display_ht` bascule l'affichage
 *   entre HT (net) et TTC (net × (1 + TVA)). La différence n'est visible que si
 *   une TVA est configurée pour le pays (sinon HT = TTC).
 */
const KultProductPrice = ({
  amount,
  currencyCode,
  isTaxInclusive,
  className,
}: {
  amount: number
  currencyCode: string
  isTaxInclusive: boolean
  className?: string
}) => {
  const { isPro, config, vatRate } = usePro()

  const rate = vatRate / 100
  const net = isTaxInclusive ? amount / (1 + rate) : amount
  const ttc = isTaxInclusive ? amount : amount * (1 + rate)

  const proActive = isPro && config.active
  const value = proActive && !config.display_ht ? ttc : proActive ? net : amount
  const suffix = proActive ? (config.display_ht ? "HT" : "TTC") : ""

  return (
    <span className={className}>
      {formatPrice(value, currencyCode)}
      {suffix && <span className="ml-1 text-base text-ink/50">{suffix}</span>}
    </span>
  )
}

export default KultProductPrice
