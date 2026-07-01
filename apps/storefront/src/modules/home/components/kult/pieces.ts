import { HttpTypes } from "@medusajs/types"

/**
 * Vue-modèle d'une pièce affichée dans le storefront KULT.
 *
 * Les données « dures » (image, nom, prix, description, catégorie, variant)
 * viennent désormais des vrais produits Medusa via {@link toPiece}.
 *
 * Les champs purement éditoriaux (pyramide olfactive, halo, surface, caption)
 * n'ont PAS de source dans Medusa : ce sont des décorations statiques génériques,
 * conservées pour garder l'identité visuelle de la maquette.
 */
export type Piece = {
  /** product.handle — sert d'URL /products/<handle> */
  handle: string
  /** product.title */
  name: string
  /** prix formaté, ex: "23 €" */
  price: string
  /** montant numérique du variant (ex: 23) */
  amount: number
  /** code devise (ex: "eur") */
  currencyCode: string
  /** id du variant à ajouter au panier Medusa */
  variantId: string | null
  /** true si le montant inclut la taxe (TTC) ; false = net (HT) */
  isTaxInclusive: boolean
  /** image principale (thumbnail) */
  image: string | null
  /** galerie d'images du produit */
  images: string[]
  /** handle de la catégorie (bougies / bougies-gold / parfums) — pour les filtres */
  categoryHandle: string | null
  /** libellé lisible de la catégorie */
  categoryLabel: string
  /** description réelle (texte) */
  description: string

  // --- Décorations éditoriales statiques (pas de source Medusa) ---
  /** notes courtes génériques */
  notes: string
  /** sous-titre sous le nom */
  scent: string
  /** légende sur la vignette */
  caption: string
  /** pyramide olfactive générique */
  pyramid: { tete: string; coeur: string; fond: string }
  /** classe de fond de repli (si pas d'image) */
  surface: string
  /** halo solaire décoratif */
  halo?: boolean
}

/** Libellés de catégorie par handle Medusa. */
export const CATEGORY_LABEL: Record<string, string> = {
  bougies: "Bougies",
  "bougies-gold": "Bougies Gold",
  parfums: "Parfums",
}

/** Pyramide olfactive générique (décor — pas de source Medusa). */
const GENERIC_PYRAMID = {
  tete: "Bergamote, agrumes",
  coeur: "Fleur d'oranger, figue",
  fond: "Musc blanc, bois clair",
} as const

const GENERIC_NOTES = "Cire de soja · Fait main"

/** Surfaces de repli (rotation) quand un produit n'a pas d'image. */
const FALLBACK_SURFACES = ["bg-soleil", "bg-terracotta", "bg-marine"] as const

/** Formate un montant Medusa (stocké tel quel : 23 = 23 €) en chaîne lisible. */
export const formatPrice = (amount: number, currencyCode = "eur"): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)

/** "23 €" -> 23 (utilitaire conservé pour compat). */
export const priceNumber = (price: string): number =>
  Number.parseInt(price, 10) || 0

/** Nettoie un texte de description (retire un éventuel HTML résiduel). */
const cleanDescription = (raw?: string | null): string =>
  (raw ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()

/**
 * Mappe un produit Medusa vers une {@link Piece}.
 * @param product produit Medusa (avec variants.calculated_price, images, categories)
 * @param index position dans la liste (pour faire tourner les surfaces de repli)
 */
export const toPiece = (
  product: HttpTypes.StoreProduct,
  index = 0
): Piece => {
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

  const category = product.categories?.[0]
  const images = (product.images ?? [])
    .map((img) => img.url)
    .filter((url): url is string => Boolean(url))
  const image = product.thumbnail ?? images[0] ?? null

  return {
    handle: product.handle ?? "",
    name: product.title ?? "Pièce",
    price: formatPrice(amount, currencyCode),
    amount,
    currencyCode,
    variantId: variant?.id ?? null,
    isTaxInclusive: calculated?.is_calculated_price_tax_inclusive ?? false,
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    categoryHandle: category?.handle ?? null,
    categoryLabel: category?.name ?? "Pièce",
    description:
      cleanDescription(product.description) ||
      "Une pièce de la collection KULT, coulée et parfumée à la main.",

    // Décorations statiques
    notes: GENERIC_NOTES,
    scent: category?.name
      ? `${category.name} · Cire de soja`
      : "Cire de soja · 220g",
    caption: `[ ${product.title ?? "Pièce"} ]`,
    pyramid: GENERIC_PYRAMID,
    surface: FALLBACK_SURFACES[index % FALLBACK_SURFACES.length],
    halo: index % 3 === 0,
  }
}

/** Mappe une liste de produits Medusa. */
export const toPieces = (
  products: HttpTypes.StoreProduct[] = []
): Piece[] => products.map((product, index) => toPiece(product, index))

/** Filtres = vraies catégories Medusa. */
export const FILTERS = [
  { key: "all", label: "Tout" },
  { key: "bougies", label: "Bougies" },
  { key: "bougies-gold", label: "Bougies Gold" },
  { key: "parfums", label: "Parfums" },
] as const

export type FilterKey = (typeof FILTERS)[number]["key"]
