"use client"

import { useState } from "react"

import { useCart } from "@modules/home/components/kult/cart-context"

type QuantityAddProps = {
  /** variant à ajouter au panier (null = produit indisponible) */
  variantId: string | null
}

/**
 * Gestion de la quantité (stepper − N +) + CTA « Ajouter au panier ».
 * Branché sur le panier global (`useCart`) qui ouvre le drawer après ajout.
 */
const QuantityAdd = ({ variantId }: QuantityAddProps) => {
  const { addItem, isMutating } = useCart()
  const [qty, setQty] = useState(1)
  const [pending, setPending] = useState(false)
  const unavailable = !variantId

  const handleAdd = async () => {
    if (!variantId) {
      return
    }
    setPending(true)
    try {
      await addItem(variantId, qty)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* QTÉ */}
      <div className="flex items-center gap-3">
        <span className="eyebrow text-ink/50">Qté</span>
        <div className="flex items-center gap-1 rounded-circle border border-ink/15 px-2">
          <button
            type="button"
            aria-label="Diminuer"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center font-mono text-base text-ink/70 transition-colors hover:text-ink"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            aria-label="Quantité"
            value={qty}
            min={1}
            onChange={(e) => {
              const n = e.target.valueAsNumber
              if (!Number.isNaN(n)) {
                setQty(Math.max(1, Math.floor(n)))
              }
            }}
            onBlur={(e) => {
              const n = e.target.valueAsNumber
              setQty(Number.isNaN(n) ? 1 : Math.max(1, Math.floor(n)))
            }}
            className="w-10 bg-transparent text-center font-mono text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Augmenter"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center font-mono text-base text-ink/70 transition-colors hover:text-ink"
          >
            +
          </button>
        </div>
      </div>

      {/* CTA — sur sa propre ligne */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={unavailable || pending || isMutating}
        className="w-fit rounded-circle bg-[#267F53] px-[45.5px] py-[10px] text-[12px] font-medium uppercase tracking-label text-ivory transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {unavailable ? "Indisponible" : pending ? "Ajout…" : "Ajouter au panier"}
      </button>
    </div>
  )
}

export default QuantityAdd
