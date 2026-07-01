"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePro } from "../context/pro-provider"

/**
 * Bandeau global affiché aux clients pro (groupe « Pros ») quand l'espace pro est actif.
 * Rappelle le mode HT et le mode de vente (achat en ligne + minimum, ou contact/devis).
 */
const ProBanner = () => {
  const { isPro, config } = usePro()

  if (!isPro || !config.active) {
    return null
  }

  const currency = (config.currency_code || "eur").toUpperCase()

  return (
    <div className="w-full bg-neutral-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-xs">
        <span className="rounded-sm bg-white/15 px-1.5 py-0.5 font-semibold uppercase tracking-wide">
          Espace Pro
        </span>
        {config.display_ht && <span>Prix affichés en HT</span>}
        {config.online_purchase_enabled ? (
          config.min_order_amount > 0 && (
            <span>
              · Minimum de commande {config.min_order_amount} {currency} HT
            </span>
          )
        ) : (
          <span>
            · Commande sur devis —{" "}
            <LocalizedClientLink href="/pro" className="underline">
              nous contacter
            </LocalizedClientLink>
          </span>
        )}
      </div>
    </div>
  )
}

export default ProBanner
