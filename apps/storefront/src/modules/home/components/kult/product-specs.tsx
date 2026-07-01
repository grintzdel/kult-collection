import type { StoreAttribute } from "@lib/data/product-attributes"

/** Sous-champs non vides d'un attribut de type groupe. */
const groupEntries = (spec: StoreAttribute) =>
  (spec.group_fields ?? [])
    .map((f) => ({
      label: f.label,
      value:
        (spec.value && typeof spec.value === "object" ? spec.value[f.key] : "") ??
        "",
    }))
    .filter((f) => f.value.trim().length > 0)

/**
 * Zone "specs" de la fiche produit : rend chaque attribut sous forme de grille
 * (un groupe = N colonnes, ex. pyramide tête/cœur/fond ; un texte = libellé + valeur).
 */
const KultProductSpecs = ({ specs }: { specs: StoreAttribute[] }) => {
  if (specs.length === 0) {
    return null
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      {specs.map((spec) => {
        if (spec.type === "group") {
          const entries = groupEntries(spec)
          if (entries.length === 0) {
            return null
          }
          return (
            <div
              key={spec.key}
              className="grid gap-4 rounded-large bg-cream p-6"
              style={{
                gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))`,
              }}
            >
              {entries.map((entry) => (
                <div key={entry.label}>
                  <span className="eyebrow text-terracotta">{entry.label}</span>
                  <p className="mt-2 font-serif text-base text-ink">{entry.value}</p>
                </div>
              ))}
            </div>
          )
        }

        const value = typeof spec.value === "string" ? spec.value : ""
        if (!value.trim()) {
          return null
        }
        return (
          <div key={spec.key} className="rounded-large bg-cream p-6">
            <span className="eyebrow text-terracotta">{spec.label}</span>
            <p className="mt-2 whitespace-pre-line font-serif text-base text-ink">
              {value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default KultProductSpecs
