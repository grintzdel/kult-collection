"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePro } from "@modules/pro/context/pro-provider"
import { useState } from "react"

import { useCart } from "./cart-context"
import { formatPrice, type Piece } from "./pieces"

const KultProductBuyBox = ({ piece }: { piece: Piece }) => {
  const { addItem, isMutating } = useCart()
  const { isPro, config, vatRate } = usePro()
  const [qty, setQty] = useState(1)
  const [pending, setPending] = useState(false)
  const unavailable = !piece.variantId

  // Mode contact/devis : le pro voit ses prix mais ne peut pas acheter en ligne.
  const proActive = isPro && config.active
  const proContactOnly = proActive && !config.online_purchase_enabled

  // Total affiché sur le bouton : HT (net) ou TTC (net × (1+TVA)) pour le pro.
  const rate = vatRate / 100
  const netUnit = piece.isTaxInclusive
    ? piece.amount / (1 + rate)
    : piece.amount
  const ttcUnit = piece.isTaxInclusive
    ? piece.amount
    : piece.amount * (1 + rate)
  const unit = proActive && !config.display_ht ? ttcUnit : proActive ? netUnit : piece.amount
  const total = unit * qty
  const totalSuffix = proActive ? (config.display_ht ? " HT" : " TTC") : ""

  const handleAdd = async () => {
    if (!piece.variantId) {
      return
    }
    setPending(true)
    try {
      await addItem(piece.variantId, qty)
    } finally {
      setPending(false)
    }
  }

  if (proContactOnly) {
    return (
      <div className="mt-8">
        <LocalizedClientLink
          href="/pro"
          className="btn-dark block w-full px-7 py-3.5 text-center"
        >
          Demander un devis
        </LocalizedClientLink>
        <p className="mt-3 text-sm text-ink/50">
          Tarifs pro sur demande — notre équipe vous recontacte.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <span className="eyebrow text-ink/50">Quantité</span>

      {/* Quantité (saisissable) + ajouter */}
      <div className="mt-4 flex items-stretch gap-3">
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

        <button
          type="button"
          onClick={handleAdd}
          disabled={unavailable || pending || isMutating}
          className="btn-dark flex-1 px-7 py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {unavailable
            ? "Indisponible"
            : pending
              ? "Ajout…"
              : `Ajouter — ${formatPrice(total, piece.currencyCode)}${totalSuffix}`}
        </button>
      </div>
    </div>
  )
}

export default KultProductBuyBox
