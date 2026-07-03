import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type ScentOption = {
  /** handle du produit-senteur → /products/<handle> */
  handle: string
  /** libellé de la senteur (product.metadata.senteur) */
  label: string
  /** true si c'est la senteur du produit courant */
  active: boolean
}

type ScentSelectorProps = {
  /** senteur du produit courant, affichée dans le libellé « ODEUR … » */
  activeLabel: string
  scents: ScentOption[]
}

/**
 * Odeurs de la gamme : chaque senteur est un PRODUIT à part entière.
 * Les pastilles sont donc des liens vers /products/<handle> ; l'active
 * (produit courant) est mise en avant sur fond soleil.
 */
const ScentSelector = ({ activeLabel, scents }: ScentSelectorProps) => {
  if (scents.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="eyebrow text-ink/50">
        Odeur <span className="font-semibold text-ink">{activeLabel}</span>
      </span>

      <div className="flex flex-wrap gap-2.5">
        {scents.map((scent) =>
          scent.active ? (
            <span
              key={scent.handle}
              aria-current="true"
              className="rounded-circle border border-[#FFCA42] bg-[#FFCA42] px-4 py-1.5 text-sm text-ink"
            >
              {scent.label}
            </span>
          ) : (
            <LocalizedClientLink
              key={scent.handle}
              href={`/products/${scent.handle}`}
              className="rounded-circle border border-[#FCA4E0] px-4 py-1.5 text-sm text-ink/80 transition-colors hover:bg-[#FCA4E0]/15 hover:text-ink"
            >
              {scent.label}
            </LocalizedClientLink>
          )
        )}
      </div>
    </div>
  )
}

export default ScentSelector
