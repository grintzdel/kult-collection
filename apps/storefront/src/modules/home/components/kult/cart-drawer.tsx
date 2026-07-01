"use client"

import { useCart } from "./cart-context"
import { formatPrice } from "./pieces"
import PieceSwatch from "./piece-swatch"

const KultCartDrawer = () => {
  const {
    lines,
    count,
    subtotal,
    shipping,
    remaining,
    freeShipping,
    lastAdded,
    giftWrap,
    isOpen,
    currencyCode,
    closeCart,
    setQty,
    removeItem,
    toggleGiftWrap,
  } = useCart()

  const progress = Math.min(100, (subtotal / (subtotal + remaining || 1)) * 100)

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Voile */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bouton fermer (sur le voile) */}
      <button
        type="button"
        onClick={closeCart}
        className={`btn absolute bottom-6 left-6 bg-marine px-5 py-3 text-ivory shadow-soft transition-all duration-500 ${
          isOpen ? "opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        × Fermer le panier
      </button>

      {/* Panneau */}
      <aside
        className={`absolute inset-y-0 right-0 flex w-[420px] max-w-[92vw] flex-col bg-ivory shadow-lift transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <span className="eyebrow text-ink/50">Votre panier</span>
            <h2 className="display mt-2 text-3xl text-ink">
              {count} {count > 1 ? "pièces" : "pièce"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-circle border border-ink/15 text-ink/60 transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>

        {/* Barre livraison offerte */}
        <div className="px-6 pt-4">
          <p className="text-sm text-ink/70">
            {freeShipping ? (
              <>
                <span className="text-soleil">◉</span> Livraison offerte — votre
                soleil voyage gratuitement.
              </>
            ) : (
              <>
                Plus que{" "}
                <span className="text-ink">
                  {formatPrice(remaining, currencyCode)}
                </span>{" "}
                pour la livraison offerte.
              </>
            )}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-circle bg-ink/10">
            <div
              className="h-full rounded-circle bg-soleil transition-all duration-700"
              style={{ width: `${freeShipping ? 100 : progress}%` }}
            />
          </div>
        </div>

        {/* Lignes */}
        <div className="mt-5 flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink/50">
              Votre panier est vide.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10 border-t border-ink/10">
              {lines.map(({ lineId, piece, qty }) => (
                <li key={lineId} className="flex gap-4 py-5">
                  <PieceSwatch
                    piece={piece}
                    rounded="rounded-t-[26px] rounded-b-base"
                    className="h-20 w-16 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {lastAdded === lineId && (
                          <span className="mb-1 inline-block rounded-circle bg-soleil px-2 py-0.5 font-mono text-[9px] uppercase tracking-label text-ink">
                            ● Vient d'être ajouté
                          </span>
                        )}
                        <h3 className="font-serif text-xl text-ink">
                          {piece.name}
                        </h3>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-label text-ink/50">
                          {piece.notes} · {piece.name}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-ink">
                        {piece.price}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1 rounded-circle border border-ink/15 px-1.5">
                        <button
                          type="button"
                          aria-label="Diminuer"
                          onClick={() => setQty(lineId, qty - 1)}
                          className="flex h-7 w-7 items-center justify-center font-mono text-ink/70 hover:text-ink"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-mono text-xs text-ink">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Augmenter"
                          onClick={() => setQty(lineId, qty + 1)}
                          className="flex h-7 w-7 items-center justify-center font-mono text-ink/70 hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(lineId)}
                        className="font-mono text-[10px] uppercase tracking-label text-ink/40 underline-offset-4 hover:text-terracotta hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Emballage cadeau */}
          {lines.length > 0 && (
            <button
              type="button"
              onClick={toggleGiftWrap}
              className="mt-4 flex w-full items-center gap-3 rounded-large border border-ink/15 px-4 py-3.5 text-left transition-colors hover:border-ink/30"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-base border ${
                  giftWrap
                    ? "border-ink bg-ink text-ivory"
                    : "border-ink/30 text-transparent"
                }`}
              >
                ✓
              </span>
              <span className="font-mono text-[11px] uppercase tracking-label text-ink">
                Emballage cadeau — offert
              </span>
            </button>
          )}
        </div>

        {/* Pied */}
        <div className="border-t border-ink/10 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow text-ink/50">Sous-total</span>
            <span className="font-serif text-3xl text-ink">
              {formatPrice(subtotal, currencyCode)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="eyebrow text-ink/50">Livraison</span>
            <span className="font-mono text-[10px] uppercase tracking-label text-ink/50">
              {shipping === 0 ? "Offerte" : "Estimée au paiement"} · TVA incluse
            </span>
          </div>

          <a
            href="/checkout"
            className="btn-dark mt-5 w-full px-7 py-4"
          >
            Passer la commande
          </a>

          <div className="mt-4 flex items-center justify-center gap-4">
            <a
              href="/cart"
              onClick={closeCart}
              className="font-mono text-[11px] uppercase tracking-label text-ink underline underline-offset-4"
            >
              Voir le panier
            </a>
            <button
              type="button"
              onClick={closeCart}
              className="font-mono text-[11px] uppercase tracking-label text-ink/50 hover:text-ink"
            >
              Continuer ⌄
            </button>
          </div>

          <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-label text-ink/40">
            ◉ Réutilisable · ✺ Emballé main · Retours 30 j
          </p>
        </div>
      </aside>
    </div>
  )
}

export default KultCartDrawer
