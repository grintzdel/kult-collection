"use client"

import { usePro } from "@modules/pro/context/pro-provider"
import { resolveProPrice } from "@modules/pro/lib/resolve-pro-price"
import { formatPrice } from "@modules/home/components/kult/pieces"

import { useQuantity } from "./quantity-context"

type ProductPriceDisplayProps = {
  amount: number
  /** prix de base avant réduction pro (barré si `onSale`) */
  originalAmount: number
  /** true si une réduction pro s'applique */
  onSale: boolean
  currencyCode: string
  isTaxInclusive: boolean
}

/**
 * Prix de la fiche produit : pro-aware (suffixe HT/TTC selon la config admin,
 * via {@link resolveProPrice}) et réactif à la quantité sélectionnée (total =
 * prix unitaire × quantité, partagée via {@link useQuantity}).
 *
 * Quand une réduction pro s'applique (`onSale`), le prix de base est barré et
 * remplacé par le prix réduit. Les deux montants passent par {@link resolveProPrice}
 * pour rester cohérents (HT/TTC + suffixe).
 */
const ProductPriceDisplay = ({
  amount,
  originalAmount,
  onSale,
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
  const { value: originalValue } = resolveProPrice(
    originalAmount,
    isTaxInclusive,
    { isPro, config, vatRate }
  )
  const total = value * qty
  const originalTotal = originalValue * qty

  return (
    <p className="flex items-baseline gap-2 font-serif text-[22px] text-ink">
      {onSale && (
        <span className="text-base text-ink/40 line-through">
          {formatPrice(originalTotal, currencyCode)}
        </span>
      )}
      <span>{formatPrice(total, currencyCode)}</span>
      {suffix && <span className="text-base text-ink/50">{suffix}</span>}
    </p>
  )
}

export default ProductPriceDisplay
