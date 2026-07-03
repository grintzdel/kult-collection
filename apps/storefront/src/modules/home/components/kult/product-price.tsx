"use client"

import { usePro } from "@modules/pro/context/pro-provider"
import { resolveProPrice } from "@modules/pro/lib/resolve-pro-price"
import { formatPrice } from "./pieces"

/**
 * Prix produit KULT. La logique pro (HT / TTC + suffixe) est centralisée dans
 * {@link resolveProPrice}, partagée avec les cartes de la page collection.
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

  const { value, suffix } = resolveProPrice(amount, isTaxInclusive, {
    isPro,
    config,
    vatRate,
  })

  return (
    <span className={className}>
      {formatPrice(value, currencyCode)}
      {suffix && <span className="ml-1 text-base text-ink/50">{suffix}</span>}
    </span>
  )
}

export default KultProductPrice
