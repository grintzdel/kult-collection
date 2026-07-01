type SwatchPiece = {
  name: string
  image?: string | null
  surface?: string
  halo?: boolean
}

type Props = {
  piece: SwatchPiece
  className?: string
  rounded?: string
}

/** Vignette d'une pièce : vraie image produit, sinon arche colorée de repli. */
const PieceSwatch = ({
  piece,
  className = "",
  rounded = "rounded-large",
}: Props) => {
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${
        piece.image ? "bg-cream" : piece.surface ?? "bg-cream"
      } ${className}`}
    >
      {piece.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={piece.image}
          alt={piece.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          {piece.halo && (
            <div className="halo-soleil absolute inset-0 opacity-70 mix-blend-screen" />
          )}
          <div className="tex-diagonal absolute inset-0" />
        </>
      )}
    </div>
  )
}

export default PieceSwatch
