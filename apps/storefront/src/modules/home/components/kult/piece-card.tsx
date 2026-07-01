import type { Piece } from "./pieces"

const KultPieceCard = ({ piece }: { piece: Piece }) => {
  return (
    <a href={`/products/${piece.handle}`} className="group block">
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-large shadow-soft transition-transform duration-500 ease-out group-hover:-translate-y-2.5 ${
          piece.image ? "bg-cream" : piece.surface
        }`}
      >
        {piece.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={piece.image}
            alt={piece.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <>
            {piece.halo && (
              <div className="halo-soleil absolute inset-0 opacity-70 mix-blend-screen" />
            )}
            <div className="tex-diagonal absolute inset-0" />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-label text-ivory/80">
              {piece.caption}
            </span>
          </>
        )}

        <span className="badge-solid absolute left-4 top-4">
          {piece.categoryLabel}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-serif text-2xl text-ink">{piece.name}</h3>
        <span className="font-mono text-sm text-terracotta">{piece.price}</span>
      </div>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-label text-ink/50">
        {piece.scent}
      </p>
    </a>
  )
}

export default KultPieceCard
