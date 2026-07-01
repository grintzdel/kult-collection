"use client"

import { useCart } from "./cart-context"
import { formatPrice } from "./pieces"
import PieceSwatch from "./piece-swatch"

const TRUST = [
  "◉ Contenant réutilisable",
  "↘ Expédié sous 2–4 jours, emballé main",
  "● Retours 30 j si non allumée",
]

const KultCartTemplate = () => {
  const {
    lines,
    count,
    subtotal,
    shipping,
    total,
    remaining,
    freeShipping,
    giftWrap,
    currencyCode,
    setQty,
    removeItem,
    toggleGiftWrap,
  } = useCart()

  const progress = Math.min(100, (subtotal / (subtotal + remaining || 1)) * 100)

  return (
    <section className="bg-ivory">
      <div className="kult-container pb-24 pt-12">
        {/* Fil d'Ariane */}
        <nav className="eyebrow text-ink/40">
          <a href="/" className="transition-colors hover:text-ink">
            Maison
          </a>
          <span className="mx-2 text-terracotta">·</span>
          <span className="text-terracotta">Panier</span>
        </nav>

        {/* En-tête */}
        <div className="mt-8 flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
          <div>
            <span className="eyebrow text-ink/50">
              Panier — {String(count).padStart(2, "0")}{" "}
              {count > 1 ? "pièces" : "pièce"}
            </span>
            <h1 className="display mt-4 text-6xl text-ink small:text-7xl">
              Votre panier<span className="text-terracotta">.</span>
            </h1>
          </div>
          <a href="/collections" className="btn-link">
            ← Continuer mes achats
          </a>
        </div>

        {count === 0 ? (
          <div className="mt-16 rounded-large border border-ink/10 py-20 text-center">
            <p className="font-serif text-2xl text-ink">
              Votre panier est vide.
            </p>
            <a href="/collections" className="btn-dark btn-lg mt-7">
              Voir la collection
            </a>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 large:grid-cols-[1.6fr_1fr]">
            {/* Articles */}
            <div>
              <div className="flex items-center justify-between border-b border-ink/15 pb-4">
                <span className="eyebrow text-ink/40">Article</span>
                <span className="eyebrow text-ink/40">Sous-total</span>
              </div>

              <ul className="divide-y divide-ink/10">
                {lines.map(({ lineId, piece, qty, lineTotal }) => (
                  <li
                    key={lineId}
                    className="flex items-start gap-5 py-7"
                  >
                    <PieceSwatch
                      piece={piece}
                      rounded="rounded-t-[40px] rounded-b-large"
                      className="h-28 w-24 shrink-0"
                    />

                    <div className="flex-1">
                      <h3 className="font-serif text-2xl text-ink">
                        {piece.name}
                      </h3>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-label text-ink/50">
                        {piece.scent}
                      </p>
                      <p className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-label text-ink/60">
                        <span className="inline-block h-2.5 w-2.5 rounded-circle bg-terracotta" />
                        {piece.name} · {piece.price}
                      </p>

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-1 rounded-circle border border-ink/15 px-1.5">
                          <button
                            type="button"
                            aria-label="Diminuer"
                            onClick={() => setQty(lineId, qty - 1)}
                            className="flex h-8 w-8 items-center justify-center font-mono text-ink/70 hover:text-ink"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-mono text-sm text-ink">
                            {qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Augmenter"
                            onClick={() => setQty(lineId, qty + 1)}
                            className="flex h-8 w-8 items-center justify-center font-mono text-ink/70 hover:text-ink"
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

                    <span className="font-serif text-2xl text-ink">
                      {formatPrice(lineTotal, currencyCode)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Emballage cadeau */}
              <button
                type="button"
                onClick={toggleGiftWrap}
                className="mt-6 flex w-full items-center justify-between gap-3 rounded-large border border-ink/15 px-5 py-4 text-left transition-colors hover:border-ink/30"
              >
                <span className="flex items-center gap-3">
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
                </span>
                <span className="font-mono text-[10px] uppercase tracking-label text-ink/40">
                  ✺ avec mot écrit main
                </span>
              </button>
            </div>

            {/* Récapitulatif */}
            <aside className="h-fit rounded-large bg-cream p-7 large:sticky large:top-6">
              <span className="eyebrow text-ink/50">Récapitulatif</span>

              <p className="mt-5 text-sm text-ink/70">
                {freeShipping ? (
                  <>
                    <span className="text-soleil">◉</span> Livraison offerte —
                    votre soleil voyage gratuitement.
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

              <div className="mt-7 flex items-center justify-between border-t border-ink/10 pt-5">
                <span className="eyebrow text-ink/50">Sous-total</span>
                <span className="font-mono text-sm text-ink">
                  {formatPrice(subtotal, currencyCode)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="eyebrow text-ink/50">Livraison</span>
                <span className="font-mono text-[11px] uppercase tracking-label text-marine">
                  {shipping === 0
                    ? "Offerte"
                    : `${formatPrice(shipping, currencyCode)} · estimée`}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-ink/10 pt-5">
                <span className="eyebrow text-ink/50">Total</span>
                <div className="text-right">
                  <div className="font-serif text-4xl leading-none text-ink">
                    {formatPrice(total, currencyCode)}
                  </div>
                  <span className="eyebrow text-ink/40">TVA incluse</span>
                </div>
              </div>

              <a href="/checkout" className="btn-dark mt-6 w-full px-7 py-4">
                Passer la commande — {formatPrice(total, currencyCode)}
              </a>

              <ul className="mt-6 space-y-2">
                {TRUST.map((t) => (
                  <li
                    key={t}
                    className="font-mono text-[10px] uppercase tracking-label text-ink/50"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-ink/10 pt-5 text-center font-mono text-[9px] uppercase tracking-label text-ink/40">
                Paiement sécurisé · CB · Apple Pay · PayPal
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}

export default KultCartTemplate
