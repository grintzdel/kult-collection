import KultPieceCard from "./piece-card"
import type { Piece } from "./pieces"

const KultRelated = ({ pieces }: { pieces: Piece[] }) => {
  return (
    <section className="bg-ivory">
      <div className="kult-container py-24 small:py-28">
        <div className="flex flex-col gap-5 small:flex-row small:items-end small:justify-between">
          <div>
            <span className="eyebrow text-ink/50">Dans la même lumière</span>
            <h2 className="display mt-4 text-4xl text-ink small:text-5xl">
              Vous aimerez aussi.
            </h2>
          </div>
          <a href="/collections" className="btn-link">
            Voir la collection ↘
          </a>
        </div>

        <div className="mt-12 grid gap-7 xsmall:grid-cols-2 medium:max-w-[640px]">
          {pieces.map((piece) => (
            <KultPieceCard key={piece.handle} piece={piece} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default KultRelated
