/**
 * Logique de résolution des attributs produit — pure, sans dépendance framework,
 * partagée par l'admin (édition) et le storefront (affichage).
 *
 * Le "quels attributs s'appliquent au produit" (scoping catégorie/produit) est fait
 * par requête côté serveur ; cette lib prend les définitions déjà applicables + la
 * `metadata` du produit et produit la liste ordonnée, dédupliquée, avec les valeurs,
 * en retirant les champs masqués (`metadata.attr_hidden`).
 */

export const ATTRIBUTE_TYPES = ["text", "textarea", "group"] as const
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number]

export const ATTRIBUTE_ZONES = ["accroche", "specs", "accordeon"] as const
export type AttributeZone = (typeof ATTRIBUTE_ZONES)[number]

export type GroupField = { key: string; label: string }

export type AttributeDefinitionInput = {
  id: string
  key: string
  label: string
  type: AttributeType
  zone: AttributeZone
  rank: number
  group_fields?: GroupField[] | null
}

export type AttributeValue = string | Record<string, string> | null

export type ResolvedAttribute = AttributeDefinitionInput & {
  value: AttributeValue
}

/** Clé de `product.metadata` listant les `key` de champs à masquer sur ce produit. */
export const HIDDEN_METADATA_KEY = "attr_hidden"

type Metadata = Record<string, unknown> | null | undefined

/** Liste des `key` masquées pour un produit (depuis `metadata.attr_hidden`). */
export const readHiddenKeys = (metadata: Metadata): string[] => {
  const raw = metadata?.[HIDDEN_METADATA_KEY]
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter((k): k is string => typeof k === "string")
}

/** Extrait la valeur d'un champ depuis la metadata, typée selon le champ. */
const readValue = (
  definition: AttributeDefinitionInput,
  metadata: Metadata
): AttributeValue => {
  const raw = metadata?.[definition.key]

  if (definition.type === "group") {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null
    }
    const source = raw as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const field of definition.group_fields ?? []) {
      const sub = source[field.key]
      if (typeof sub === "string") {
        out[field.key] = sub
      }
    }
    return out
  }

  return typeof raw === "string" ? raw : null
}

/**
 * Résout les attributs applicables à un produit.
 * @param definitions définitions déjà applicables (héritées catégorie + ajouts produit)
 * @param metadata `product.metadata`
 */
export const resolveProductAttributes = (
  definitions: AttributeDefinitionInput[],
  metadata: Metadata
): ResolvedAttribute[] => {
  const hidden = new Set(readHiddenKeys(metadata))

  const byId = new Map<string, AttributeDefinitionInput>()
  for (const def of definitions) {
    if (!hidden.has(def.key)) {
      byId.set(def.id, def)
    }
  }

  return [...byId.values()]
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
    .map((def) => ({ ...def, value: readValue(def, metadata) }))
}

/** Un attribut résolu a-t-il une valeur à afficher ? (storefront : masque les vides) */
export const hasAttributeValue = (attr: ResolvedAttribute): boolean => {
  if (attr.type === "group") {
    return Object.values(attr.value ?? {}).some((v) => v.trim().length > 0)
  }
  return typeof attr.value === "string" && attr.value.trim().length > 0
}

/** Ne conserve que les attributs ayant une valeur (usage storefront). */
export const withValuesOnly = (
  attributes: ResolvedAttribute[]
): ResolvedAttribute[] => attributes.filter(hasAttributeValue)

/** Regroupe les attributs par zone d'affichage, en préservant l'ordre. */
export const groupAttributesByZone = (
  attributes: ResolvedAttribute[]
): Record<AttributeZone, ResolvedAttribute[]> => {
  const groups: Record<AttributeZone, ResolvedAttribute[]> = {
    accroche: [],
    specs: [],
    accordeon: [],
  }
  for (const attr of attributes) {
    groups[attr.zone].push(attr)
  }
  return groups
}
