"use client"

import { useState } from "react"

import KultPieceCard from "./piece-card"
import { FILTERS, type FilterKey, type Piece } from "./pieces"

const KultCollectionGrid = ({ pieces }: { pieces: Piece[] }) => {
  const [active, setActive] = useState<FilterKey>("all")

  const filtered =
    active === "all"
      ? pieces
      : pieces.filter((p) => p.categoryHandle === active)

  // N'affiche que les filtres pour lesquels il existe au moins un produit.
  const availableFilters = FILTERS.filter(
    (f) => f.key === "all" || pieces.some((p) => p.categoryHandle === f.key)
  )

  return (
    <section className="bg-ivory">
      <div className="kult-container pb-28 pt-12">
        {/* Barre de filtres */}
        <div className="flex flex-col gap-5 small:flex-row small:items-center small:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-1 text-ink/40">Filtrer</span>
            {availableFilters.map((filter) => {
              const isActive = active === filter.key
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActive(filter.key)}
                  className={
                    isActive
                      ? "rounded-circle bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-label text-ivory"
                      : "rounded-circle border border-ink/15 px-4 py-2 font-mono text-[11px] uppercase tracking-label text-ink/60 transition-colors hover:border-ink/40 hover:text-ink"
                  }
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          <span className="eyebrow text-ink/40">
            {String(filtered.length).padStart(2, "0")} pièces · Cire de soja
          </span>
        </div>

        <div className="mt-7 h-px w-full bg-ink/10" />

        {/* Grille */}
        {filtered.length === 0 ? (
          <p className="mt-16 text-center font-serif text-2xl text-ink/60">
            Aucune pièce dans cette catégorie.
          </p>
        ) : (
          <div className="mt-12 grid gap-7 xsmall:grid-cols-2 medium:grid-cols-4">
            {filtered.map((piece) => (
              <KultPieceCard key={piece.handle} piece={piece} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default KultCollectionGrid
