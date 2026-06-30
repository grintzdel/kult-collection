import KultPieceCard from "./piece-card"
import type { Piece } from "./pieces"

const KultCollection = ({ pieces }: { pieces: Piece[] }) => {
  if (pieces.length === 0) {
    return null
  }

  return (
    <section className="bg-ivory">
      <div className="kult-container py-24 small:py-28">
        <div className="flex flex-col gap-6 small:flex-row small:items-end small:justify-between">
          <div>
            <span className="eyebrow text-ink/50">La collection</span>
            <h2 data-split className="display mt-4 text-4xl text-ink small:text-5xl">
              Des pièces
              <br />à collectionner.
            </h2>
          </div>
          <a href="/collections" className="btn-link">
            Voir tout ↘
          </a>
        </div>

        <div data-reveal-group className="mt-14 grid gap-7 small:grid-cols-3">
          {pieces.map((piece) => (
            <KultPieceCard key={piece.handle} piece={piece} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default KultCollection
