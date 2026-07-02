type ProductTagProps = {
  value: string
  color: string | null
}

/**
 * Tag d'ambiance du produit (ex. « CALIFORNIA ») précédé de sa pastille de
 * couleur. `color` vient de la résolution backend `/store/product-ambiances`.
 */
const ProductTag = ({ value, color }: ProductTagProps) => {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-circle"
        style={{ backgroundColor: color ?? "#242121" }}
      />
      <span className="font-mono text-[10px] uppercase tracking-label text-ink/70">
        {value}
      </span>
    </div>
  )
}

export default ProductTag
