import { HttpTypes } from "@medusajs/types"
import type { ProductAmbiance } from "@lib/data/collection-ambiances"
import { resolveProPrice, type ProPricing } from "@modules/pro/lib/resolve-pro-price"

/**
 * Vue-modèle d'une carte produit de la page Collection (maquette `Collection.png`) :
 * photo produit sur fond clair, titre, catégorie, prix, badge « new » optionnel,
 * et un flag `isHighlight` pour la pièce mise en avant (seule sur la 1ʳᵉ ligne).
 */
export type CardModel = {
  handle: string
  /** partie « type » du titre, rendue en romain (ex. "Petite assiette") */
  titleLead: string
  /** partie distinctive du titre, rendue en italique (ex. "Cerise") */
  titleEmphasis: string
  /** titre complet (fallback / alt image) */
  name: string
  /** libellé de la catégorie affiché sous le titre */
  categoryLabel: string
  /** libellé du tag d'ambiance (pastille + majuscules) — null si aucune ambiance */
  ambianceLabel: string | null
  /** couleur (hex) de la pastille d'ambiance — null si aucune / non définie */
  ambianceColor: string | null
  /** prix formaté, ex: "25 €" (ajusté HT/TTC si client pro) */
  price: string
  /** suffixe pro : "" (B2C), "HT" ou "TTC" — affiché à côté du prix */
  priceSuffix: string
  /** photo produit */
  image: string | null
  /** id de la variante par défaut (ajout panier rapide) */
  variantId: string | null
  /** badge « new » (metadata.is_new) */
  isNew: boolean
  /** badge « produit phare » (metadata.is_featured) */
  isFeatured: boolean
  /** mise en avant (metadata.highlight) — rendue seule sur la 1ʳᵉ ligne */
  isHighlight: boolean
  /** sous-ligne : « N senteurs disponibles » (bougies), « N tailles disponibles »
   *  (variante) ou « N autres modèles » (autres produits du type) — null si rien */
  variantLabel: string | null
}

/**
 * Préfixes « type de pièce » connus (du plus long au plus court) : le reste du
 * titre est la partie distinctive, rendue en italique dans la maquette.
 */
const TITLE_LEADS = [
  "Bougie Céramique",
  "Diffuseur Floral",
  "Petite assiette",
  "Grande assiette",
  "Coffret",
  "Bougeoir",
  "Diffuseur",
  "Bougie",
  "Carafe",
  "Gamelle",
  "Assiette",
  "Pichet",
  "Tasse",
  "Vase",
  "Mug",
] as const

export const splitTitle = (name: string): { lead: string; emphasis: string } => {
  const trimmed = name.trim()
  const lead = TITLE_LEADS.find((p) =>
    trimmed.toLowerCase().startsWith(p.toLowerCase())
  )
  if (lead) {
    const emphasis = trimmed.slice(lead.length).trim()
    return emphasis ? { lead, emphasis } : { lead: "", emphasis: lead }
  }
  const spaceIdx = trimmed.indexOf(" ")
  if (spaceIdx === -1) {
    return { lead: "", emphasis: trimmed }
  }
  return {
    lead: trimmed.slice(0, spaceIdx),
    emphasis: trimmed.slice(spaceIdx + 1).trim(),
  }
}

export const formatPrice = (amount: number, currencyCode = "eur"): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)

const asBool = (value: unknown): boolean =>
  value === true || value === "true" || value === 1

/**
 * Clé de « type » d'un produit = le lead de son titre (Assiette, Tasse,
 * Bougie…). Sert à regrouper les modèles PAR TYPE (une assiette a pour autres
 * modèles les autres assiettes, pas toute la vaisselle).
 */
export const productTypeKey = (name: string): string => {
  const { lead, emphasis } = splitTitle(name)
  return (lead || emphasis).trim().toLowerCase()
}

/**
 * Une bougie (classique OU céramique) ne se distingue QUE par sa senteur : son
 * axe Taille n'est pas un critère de choix pertinent sur la carte. On les repère
 * par leur catégorie ("Bougie …") avec repli sur le titre ("Bougie …").
 */
const isCandle = (product: HttpTypes.StoreProduct): boolean => {
  const category = product.categories?.[0]?.name?.toLowerCase() ?? ""
  if (category.startsWith("bougie")) {
    return true
  }
  return (product.title ?? "").trim().toLowerCase().startsWith("bougie")
}

/**
 * Sous-ligne de la carte (maquette), alignée sur le modèle métier
 * (senteurs / tailles / modèles) :
 * - bougie (classique ou céramique) → « N senteurs disponibles » : elles ne
 *   diffèrent QUE par l'odeur, jamais par la taille ni le modèle ;
 * - sinon si le produit porte un axe **Taille** (variante) → « N tailles disponibles » ;
 * - sinon → « N autres modèles » où N = nombre d'AUTRES produits du MÊME TYPE
 *   (assiette, tasse…). Un « modèle » est un PRODUIT distinct, pas une variante.
 *
 * @param sameTypeCount total de produits partageant le type du produit
 */
const readCardSubline = (
  product: HttpTypes.StoreProduct,
  sameTypeCount: number
): string | null => {
  if (isCandle(product)) {
    const n = sameTypeCount
    if (n <= 0) {
      return null
    }
    return `${n} senteur${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}`
  }

  const taille = product.options?.find(
    (o) => o.title?.toLowerCase() === "taille" && (o.values?.length ?? 0) > 1
  )
  if (taille) {
    const n = taille.values?.length ?? 0
    return `${n} taille${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}`
  }

  const others = Math.max(0, sameTypeCount - 1)
  if (others <= 0) {
    return null
  }
  return `${others} autre${others > 1 ? "s" : ""} modèle${others > 1 ? "s" : ""}`
}

export const toCardModel = (
  product: HttpTypes.StoreProduct,
  ambiance: ProductAmbiance | null = null,
  sameTypeCount = 0,
  pricing?: ProPricing
): CardModel => {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>
  const variant = product.variants?.[0]
  const calculated = variant?.calculated_price as
    | {
        calculated_amount?: number
        currency_code?: string
        is_calculated_price_tax_inclusive?: boolean
      }
    | undefined
  const amount = calculated?.calculated_amount ?? 0
  const currencyCode = calculated?.currency_code ?? "eur"
  const isTaxInclusive =
    calculated?.is_calculated_price_tax_inclusive ?? false

  // Ajustement pro (HT/TTC + suffixe) : sans contexte pro fourni, comportement
  // B2C inchangé (montant net, aucun suffixe).
  const { value: priceValue, suffix: priceSuffix } = pricing
    ? resolveProPrice(amount, isTaxInclusive, pricing)
    : { value: amount, suffix: "" }

  const image =
    product.thumbnail ?? product.images?.[0]?.url ?? null

  const name = product.title ?? "Pièce"
  const { lead, emphasis } = splitTitle(name)
  const categoryLabel = product.categories?.[0]?.name ?? ""

  return {
    handle: product.handle ?? "",
    titleLead: lead,
    titleEmphasis: emphasis,
    name,
    categoryLabel,
    // Ambiance effective résolue côté backend (surcharge produit sinon héritage
    // catégorie) : libellé du tag + couleur de sa pastille. Null → pas de chip.
    ambianceLabel: ambiance?.value ?? null,
    ambianceColor: ambiance?.color ?? null,
    price: formatPrice(priceValue, currencyCode),
    priceSuffix,
    image,
    variantId: variant?.id ?? null,
    isNew: asBool(metadata.is_new),
    isFeatured: asBool(metadata.is_featured),
    isHighlight: asBool(metadata.highlight),
    variantLabel: readCardSubline(product, sameTypeCount),
  }
}

export const toCardModels = (
  products: HttpTypes.StoreProduct[] = [],
  ambianceMap: Record<string, ProductAmbiance | null> = {},
  pricing?: ProPricing
): CardModel[] => {
  // Compte de produits par type (assiette, tasse…) sur le lot affiché : sert au
  // « N autres modèles ». Les types étant propres à une catégorie, le compte est
  // exact même quand un filtre catégorie est actif.
  const countByType: Record<string, number> = {}
  for (const product of products) {
    const key = productTypeKey(product.title ?? "")
    countByType[key] = (countByType[key] ?? 0) + 1
  }

  return products.map((product) =>
    toCardModel(
      product,
      ambianceMap[product.id] ?? null,
      countByType[productTypeKey(product.title ?? "")] ?? 0,
      pricing
    )
  )
}

/**
 * Place la pièce mise en avant en tête de liste (elle occupera la 1ʳᵉ ligne,
 * seule, si le pattern commence par 1). Stable pour le reste.
 */
export const withHighlightFirst = (cards: CardModel[]): CardModel[] => {
  const idx = cards.findIndex((c) => c.isHighlight)
  if (idx <= 0) {
    return cards
  }
  const copy = [...cards]
  const [highlight] = copy.splice(idx, 1)
  return [highlight, ...copy]
}
