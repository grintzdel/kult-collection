"use client"

import { useState, useTransition } from "react"

import { addToCart } from "@lib/data/cart"

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
 */
const QuickAddButton = ({ variantId, countryCode, label }: QuickAddButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

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
