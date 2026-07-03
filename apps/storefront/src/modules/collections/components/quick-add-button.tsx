"use client"

import { useState, useTransition } from "react"

import { addToCart } from "@lib/data/cart"
import { usePro } from "@modules/pro/context/pro-provider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type QuickAddButtonProps = {
  variantId: string | null
  countryCode: string
  /** libellé accessible (nom de la pièce) */
  label: string
}

/**
 * Bouton « + » de la carte Collection (maquette) : ajout panier rapide de la
 * variante par défaut. Contenu (hors du lien de la carte) pour rester un vrai
 * `<button>`. État bref « ✓ » après ajout.
 *
 * Cohérent avec la fiche produit : un pro dont l'espace est actif mais dont
 * l'achat en ligne est désactivé (option admin `online_purchase_enabled`) ne
 * peut pas ajouter au panier — il est renvoyé vers la demande de devis.
 */
const QuickAddButton = ({ variantId, countryCode, label }: QuickAddButtonProps) => {
  const { isPro, config } = usePro()
  const proContactOnly = isPro && config.active && !config.online_purchase_enabled

  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (proContactOnly) {
    return (
      <LocalizedClientLink
        href="/pro#devis"
        className="font-mono text-[11px] uppercase tracking-label text-ink/50 transition-colors hover:text-terracotta"
      >
        Sur devis
      </LocalizedClientLink>
    )
  }

  const handleAdd = () => {
    if (!variantId || isPending) {
      return
    }
    startTransition(async () => {
      await addToCart({ variantId, quantity: 1, countryCode })
      setDone(true)
      setTimeout(() => setDone(false), 1400)
    })
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!variantId || isPending}
      aria-label={`Ajouter ${label} au panier`}
      className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink/70 transition-colors hover:border-terracotta hover:text-terracotta disabled:opacity-40"
    >
      <span className="font-mono text-base leading-none">
        {done ? "✓" : isPending ? "…" : "+"}
      </span>
    </button>
  )
}

export default QuickAddButton
