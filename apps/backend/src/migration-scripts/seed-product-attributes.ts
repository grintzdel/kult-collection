import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { PRODUCT_ATTRIBUTE_MODULE } from "../modules/product-attribute"
import { createAttributeDefinitionWorkflow } from "../workflows/product-attribute/create-attribute-definition"
import { createTrustBadgeWorkflow } from "../workflows/product-attribute/manage-trust-badges"

type SeedDefinition = {
  key: string
  label: string
  type: "text" | "textarea" | "group"
  zone: "accroche" | "specs" | "accordeon"
  rank: number
  group_fields?: { key: string; label: string }[] | null
  /** Noms de catégories concernées ; vide = toutes. */
  categories: string[]
}

const DEFINITIONS: SeedDefinition[] = [
  { key: "notes", label: "Notes", type: "text", zone: "accroche", rank: 0, categories: [] },
  { key: "matiere", label: "Matière", type: "text", zone: "specs", rank: 0, categories: [] },
  {
    key: "pyramide",
    label: "Pyramide olfactive",
    type: "group",
    zone: "specs",
    rank: 1,
    group_fields: [
      { key: "tete", label: "Tête" },
      { key: "coeur", label: "Cœur" },
      { key: "fond", label: "Fond" },
    ],
    categories: ["Bougies", "Bougies Gold", "Parfums"],
  },
  {
    key: "details_matiere",
    label: "Détails & matière",
    type: "textarea",
    zone: "accordeon",
    rank: 0,
    categories: [],
  },
  {
    key: "utilisation",
    label: "Utilisation",
    type: "textarea",
    zone: "accordeon",
    rank: 1,
    categories: [],
  },
  {
    key: "livraison_retours",
    label: "Livraison & retours",
    type: "textarea",
    zone: "accordeon",
    rank: 2,
    categories: [],
  },
]

const TRUST_BADGES = [
  { icon: "♻", label: "Contenant réutilisable", rank: 0 },
  { icon: "✺", label: "Fait main à Grasse", rank: 1 },
  { icon: "↘", label: "Livraison soignée 2–4 j", rank: 2 },
]

/** Valeurs par défaut appliquées à tous les produits (démo). */
type AttributeValues = {
  notes: string
  matiere: string
  pyramide: { tete: string; coeur: string; fond: string }
  details_matiere: string
  utilisation: string
  livraison_retours: string
}

const BASE_VALUES: AttributeValues = {
  notes: "Cire de soja · Fait main",
  matiere: "Cire de soja végétale",
  pyramide: {
    tete: "Bergamote, agrumes",
    coeur: "Fleur d'oranger, figue",
    fond: "Musc blanc, bois clair",
  },
  details_matiere:
    "Coulée à la main. Cire de soja végétale, mèche en coton. Contenant réutilisable une fois la cire épuisée.",
  utilisation:
    "Première combustion : laissez fondre la cire jusqu'aux bords pour éviter le tunnel. Recoupez la mèche à 5 mm avant chaque usage. Ne jamais laisser brûler plus de 4 heures.",
  livraison_retours:
    "Expédition soignée sous 2 à 4 jours ouvrés. Retours acceptés sous 14 jours, contenant non utilisé.",
}

/** Ajustements par catégorie (le reste retombe sur BASE_VALUES). */
const CATEGORY_OVERRIDES: Record<string, Partial<AttributeValues>> = {
  "Bougies Gold": {
    notes: "Édition Gold · Fait main à Grasse",
    matiere: "Céramique émaillée · Cire de soja végétale",
    details_matiere:
      "Contenant en céramique émaillée coulé à la main. Cire de soja 100 % naturelle, mèche coton. Contenant réutilisable.",
  },
  Parfums: {
    notes: "Parfum de Grasse · Sans alcool",
    matiere: "Sans alcool · 100 % biodégradable",
    pyramide: {
      tete: "Agrumes, bergamote",
      coeur: "Jasmin, fleur d'oranger",
      fond: "Bois de cèdre, musc",
    },
    utilisation:
      "Secouez avant emploi. Vaporisez dans la pièce et sur les textiles. Évitez le contact direct avec les surfaces fragiles.",
  },
}

const valuesForCategory = (name?: string): AttributeValues => ({
  ...BASE_VALUES,
  ...(name ? CATEGORY_OVERRIDES[name] ?? {} : {}),
})

/** Une valeur metadata est-elle absente/vide (donc à remplir par le seed) ? */
const isEmptyValue = (value: unknown): boolean => {
  if (value == null) {
    return true
  }
  if (typeof value === "string") {
    return value.trim().length === 0
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0
  }
  return false
}

export default async function seedProductAttributes({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)

  logger.info("Seeding product attribute definitions...")

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })
  const categoryIdByName = new Map<string, string>(
    categories.map((c) => [c.name as string, c.id as string])
  )
  const allCategoryIds = categories.map((c) => c.id as string)

  const existing = await service.listAttributeDefinitions()
  const existingKeys = new Set(existing.map((d) => d.key))

  for (const def of DEFINITIONS) {
    if (existingKeys.has(def.key)) {
      logger.info(`  · ${def.key} existe déjà, ignoré`)
      continue
    }
    const category_ids = def.categories.length
      ? def.categories
          .map((name) => categoryIdByName.get(name))
          .filter((id): id is string => Boolean(id))
      : allCategoryIds

    await createAttributeDefinitionWorkflow(container).run({
      input: {
        key: def.key,
        label: def.label,
        type: def.type,
        zone: def.zone,
        rank: def.rank,
        group_fields: def.group_fields ?? null,
        category_ids,
      },
    })
    logger.info(`  ✔ ${def.key} créé (${category_ids.length} catégorie(s))`)
  }

  const existingBadges = await service.listTrustBadges()
  if (existingBadges.length === 0) {
    for (const badge of TRUST_BADGES) {
      await createTrustBadgeWorkflow(container).run({ input: badge })
    }
    logger.info(`  ✔ ${TRUST_BADGES.length} badges de réassurance créés`)
  } else {
    logger.info("  · Badges de réassurance déjà présents, ignorés")
  }

  logger.info("Seeding attribute values on products...")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "metadata", "categories.name"],
  })

  const updates: { id: string; metadata: Record<string, unknown> }[] = []
  for (const product of products) {
    const metadata = (product.metadata ?? {}) as Record<string, unknown>
    const primaryCategory = (
      product.categories as { name: string }[] | undefined
    )?.[0]?.name
    const defaults = valuesForCategory(primaryCategory)

    const merged: Record<string, unknown> = { ...metadata }
    let changed = false
    for (const [key, value] of Object.entries(defaults)) {
      // Ne remplit que les champs vides — préserve les valeurs déjà saisies.
      if (isEmptyValue(metadata[key])) {
        merged[key] = value
        changed = true
      }
    }
    if (changed) {
      updates.push({ id: product.id as string, metadata: merged })
    }
  }

  if (updates.length > 0) {
    await updateProductsWorkflow(container).run({
      input: { products: updates },
    })
    logger.info(`  ✔ Valeurs seedées sur ${updates.length} produit(s)`)
  } else {
    logger.info("  · Tous les produits ont déjà leurs valeurs, rien à faire")
  }

  logger.info("Finished seeding product attributes.")
}
