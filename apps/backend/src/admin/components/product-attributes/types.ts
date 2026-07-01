export type AttributeType = "text" | "textarea" | "group"
export type AttributeZone = "accroche" | "specs" | "accordeon"
export type GroupField = { key: string; label: string }

export type LinkedCategory = { id: string; name: string }

export type AttributeDefinition = {
  id: string
  key: string
  label: string
  type: AttributeType
  zone: AttributeZone
  rank: number
  group_fields?: GroupField[] | null
  product_categories?: LinkedCategory[]
}

export type TrustBadge = {
  id: string
  icon: string
  label: string
  rank: number
}

export const TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "group", label: "Groupe (sous-champs)" },
]

export const ZONE_OPTIONS: { value: AttributeZone; label: string }[] = [
  { value: "accroche", label: "Accroche (près du prix)" },
  { value: "specs", label: "Specs (grille)" },
  { value: "accordeon", label: "Accordéon (bas de fiche)" },
]

export const typeLabel = (type: AttributeType) =>
  TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type

export const zoneLabel = (zone: AttributeZone) =>
  ZONE_OPTIONS.find((o) => o.value === zone)?.label ?? zone

export const PRODUCT_ATTRIBUTES_QUERY_KEY = ["product-attribute-definitions"]
export const TRUST_BADGES_QUERY_KEY = ["trust-badges"]
