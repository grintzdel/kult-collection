import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
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

  logger.info("Finished seeding product attributes.")
}
