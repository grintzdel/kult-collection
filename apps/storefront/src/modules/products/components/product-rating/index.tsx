type ProductRatingProps = {
  /** Nombre d'avis (0 pour l'instant — les avis dynamiques viendront plus tard). */
  count?: number
  /** Note sur 5 (0 = étoiles vides). */
  value?: number
}

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.4}
    aria-hidden
  >
    <path
      strokeLinejoin="round"
      d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.95 2.6.95-5.5-4-3.9 5.53-.8L10 1.6z"
    />
  </svg>
)

/**
 * Bloc avis — placeholder : 5 étoiles vides + « N avis ».
 * Prévu pour brancher un vrai système d'avis dynamique ultérieurement.
 */
const ProductRating = ({ count = 0, value = 0 }: ProductRatingProps) => {
  return (
    <div className="flex items-center gap-2 text-[#F6C842]">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < Math.round(value)} />
        ))}
      </div>
      <span className="text-sm text-ink/50 underline underline-offset-2">
        {count} avis
      </span>
    </div>
  )
}

export default ProductRating
