"use client"

import { usePro } from "@modules/pro/context/pro-provider"
import { resolveProPrice } from "@modules/pro/lib/resolve-pro-price"
import { formatPrice } from "@modules/home/components/kult/pieces"

import { useQuantity } from "./quantity-context"

type ProductPriceDisplayProps = {
  amount: number
  currencyCode: string
  isTaxInclusive: boolean
}

/**
 * Prix de la fiche produit : pro-aware (suffixe HT/TTC selon la config admin,
 * via {@link resolveProPrice}) et réactif à la quantité sélectionnée (total =
 * prix unitaire × quantité, partagée via {@link useQuantity}).
 */
const ProductPriceDisplay = ({
  amount,
  currencyCode,
  isTaxInclusive,
}: ProductPriceDisplayProps) => {
  const { isPro, config, vatRate } = usePro()
  const { qty } = useQuantity()

  const { value, suffix } = resolveProPrice(amount, isTaxInclusive, {
    isPro,
    config,
    vatRate,
  })
  const total = value * qty

  return (
    <p className="font-serif text-[22px] text-ink">
      {formatPrice(total, currencyCode)}
      {suffix && <span className="ml-1 text-base text-ink/50">{suffix}</span>}
    </p>
  )
}

export default ProductPriceDisplay
