/**
 * Ambiances de la collection (miroir du seed backend `apply-ambiances.ts`).
 * Constante partagée page ↔ sidebar : chaque ambiance a un `slug` (URL `?ambiance=`),
 * une `value` (valeur du tag backend, sert au filtrage) et sa pastille de couleur.
 */
export type CollectionAmbiance = {
  slug: string
  value: string
  label: string
  color: string
}

export const COLLECTION_AMBIANCES: CollectionAmbiance[] = [
  { slug: "california", value: "california", label: "California", color: "#FCA4E0" },
  { slug: "palm-beach", value: "palm beach", label: "Palm Beach", color: "#267F53" },
  { slug: "cozy", value: "cozy", label: "Cozy", color: "#FFCA42" },
  { slug: "mediterranee", value: "méditerranée", label: "Méditerranée", color: "#2373EA" },
]

export const findAmbianceBySlug = (
  slug?: string | null
): CollectionAmbiance | null =>
  slug ? COLLECTION_AMBIANCES.find((a) => a.slug === slug) ?? null : null

/** Vrai si l'ambiance effective d'un produit correspond à l'ambiance ciblée. */
export const matchesAmbiance = (
  ambianceValue: string | null | undefined,
  target: CollectionAmbiance
): boolean =>
  !!ambianceValue &&
  ambianceValue.trim().toLowerCase() === target.value.toLowerCase()
