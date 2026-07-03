"use client"

import { useState } from "react"

import { useCart } from "@modules/home/components/kult/cart-context"
import type { Piece } from "@modules/home/components/kult/pieces"

/** « Assiette L'Amour au Soleil » → ["Assiette", "L'Amour au Soleil"]. */
const splitName = (name: string): [string, string] => {
  const idx = name.indexOf(" ")
  return idx === -1 ? [name, ""] : [name.slice(0, idx), name.slice(idx + 1)]
}

/**
 * Carte d'une pièce du lot : visuel + nom (type romain / descriptif italique) +
 * prix + bouton « + » qui ajoute directement la pièce au panier (quick-add).
 */
const LotCard = ({ piece }: { piece: Piece }) => {
  const { addItem, isMutating } = useCart()
  const [pending, setPending] = useState(false)
  const [type, rest] = splitName(piece.name)

  const handleAdd = async () => {
    if (!piece.variantId) {
      return
    }
    setPending(true)
    try {
      await addItem(piece.variantId, 1)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="group flex h-full flex-col p-5 small:p-6">
      <a href={`/products/${piece.handle}`} className="block">
        <div className="flex aspect-square items-center justify-center overflow-hidden bg-ivory">
          {piece.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={piece.image}
              alt={piece.name}
              className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className={`h-full w-full ${piece.surface}`} />
          )}
        </div>
      </a>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <a href={`/products/${piece.handle}`}>
            <h3 className="font-serif text-lg leading-tight text-ink transition-colors group-hover:text-terracotta">
              {type}
              {rest && (
                <>
                  {" "}
                  <span className="italic">{rest}</span>
                </>
              )}
            </h3>
          </a>
          <span className="mt-1 block font-mono text-xs text-ink/60">
            {piece.price}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Ajouter ${piece.name} au panier`}
          onClick={handleAdd}
          disabled={!piece.variantId || pending || isMutating}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border border-ink/25 font-mono text-lg leading-none text-ink/70 transition-colors hover:border-ink hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "·" : "+"}
        </button>
      </div>
    </div>
  )
}

export default LotCard
