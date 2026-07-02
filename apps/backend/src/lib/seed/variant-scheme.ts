/**
 * Schéma de variantes par catégorie pour le seed produits.
 *
 * Chaque catégorie décline ses produits sur UN axe cohérent :
 * - Bougies / Bougies Gold → `Taille`
 * - Parfums (diffuseurs)    → `Contenance`
 * - Céramiques (défaut)     → `Coloris`
 *
 * La variante "de base" reprend le prix existant du produit ; les autres
 * variantes ont un prix fixe défini ci-dessous.
 */

type SeedProduct = {
  name: string
  category: string
  price: number
  currency: string
}

type VariantSpec = { value: string; skuSuffix: string; amount: number }

const schemeFor = (
  category: string,
  basePrice: number
): { optionTitle: string; specs: VariantSpec[] } => {
  switch (category) {
    case "Bougies":
      return {
        optionTitle: "Taille",
        specs: [
          { value: "250 g", skuSuffix: "250G", amount: basePrice },
          { value: "500 g", skuSuffix: "500G", amount: 39 },
        ],
      }
    case "Bougies Gold":
      return {
        optionTitle: "Taille",
        specs: [
          { value: "180 g", skuSuffix: "180G", amount: basePrice },
          { value: "320 g", skuSuffix: "320G", amount: 65 },
        ],
      }
    case "Parfums":
      return {
        optionTitle: "Contenance",
        specs: [
          { value: "100 ml", skuSuffix: "100ML", amount: 20 },
          { value: "200 ml", skuSuffix: "200ML", amount: basePrice },
        ],
      }
    default:
      // Céramiques : même prix, décliné en coloris (modèles).
      return {
        optionTitle: "Coloris",
        specs: [
          { value: "Blanc", skuSuffix: "BLANC", amount: basePrice },
          { value: "Terracotta", skuSuffix: "TERRA", amount: basePrice },
          { value: "Bleu Riviera", skuSuffix: "BLEU", amount: basePrice },
        ],
      }
  }
}

/**
 * Construit les `options` et `variants` d'un produit pour
 * `createProductsWorkflow`, selon le schéma de sa catégorie.
 * @param handle handle déjà slugifié du produit (base du SKU)
 */
export const buildProductOptionsAndVariants = (
  product: SeedProduct,
  handle: string
) => {
  const { optionTitle, specs } = schemeFor(product.category, product.price)
  const currencyCode = product.currency.toLowerCase()

  return {
    options: [{ title: optionTitle, values: specs.map((s) => s.value) }],
    variants: specs.map((s) => ({
      title: `${product.name} – ${s.value}`,
      sku: `${handle.toUpperCase()}-${s.skuSuffix}`,
      manage_inventory: true,
      options: { [optionTitle]: s.value },
      prices: [{ amount: s.amount, currency_code: currencyCode }],
    })),
  }
}
