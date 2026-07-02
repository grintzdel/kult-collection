import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createProductTagsWorkflow,
  updateProductCategoriesWorkflow,
  updateProductTagsWorkflow,
} from "@medusajs/medusa/core-flows"
import { setProductAmbianceWorkflow } from "../../workflows/ambiance/set-product-ambiance"
import {
  CERAMIC_CANDLES_CATEGORY,
  CLASSIC_CANDLES_CATEGORY,
  TABLEWARE_CATEGORY,
} from "./categories"

/** Ambiances (tags produit) et leur couleur par défaut (hex). */
const AMBIANCE_COLORS: Record<string, string> = {
  california: "#FCA4E0",
  "palm beach": "#267F53",
  cozy: "#FFCA42",
  méditerranée: "#2373EA",
}

/** Ambiance héritée par chaque catégorie FEUILLE (par nom). */
const CATEGORY_AMBIANCE: Record<string, string> = {
  [CLASSIC_CANDLES_CATEGORY]: "cozy",
  [CERAMIC_CANDLES_CATEGORY]: "california",
  Diffuseurs: "méditerranée",
  Gamelles: "palm beach",
  [TABLEWARE_CATEGORY]: "palm beach",
}

/**
 * Câblage backend des ambiances (idempotent, non destructif) :
 * 1. crée les tags d'ambiance manquants et synchronise leur couleur ;
 * 2. assigne l'ambiance héritée à chaque catégorie feuille
 *    (`metadata.ambiance_tag_id`) ;
 * 3. pose une surcharge démo sur la 1re "Bougie classique".
 *
 * Rejouable : ne recrée pas les tags existants, réapplique juste les liens.
 */
export const applyAmbianceWiring = async (
  container: MedusaContainer
): Promise<void> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const ambianceValues = Object.keys(AMBIANCE_COLORS)

  // 1. Tags : ne crée que ceux qui manquent.
  const { data: existingTags } = await query.graph({
    entity: "product_tag",
    fields: ["id", "value"],
  })
  const tagIdByValue = new Map<string, string>(
    (existingTags as { id: string; value: string }[]).map((t) => [t.value, t.id])
  )

  const missing = ambianceValues.filter((v) => !tagIdByValue.has(v))
  if (missing.length) {
    const { result: created } = await createProductTagsWorkflow(container).run({
      input: {
        product_tags: missing.map((value) => ({
          value,
          metadata: { color: AMBIANCE_COLORS[value] },
        })),
      },
    })
    for (const t of created as { id: string; value: string }[]) {
      tagIdByValue.set(t.value, t.id)
    }
    logger.info(`Ambiances créées : ${missing.join(", ")}`)
  } else {
    logger.info("Toutes les ambiances existent déjà.")
  }

  // 1b. Synchronise la couleur (met à jour les tags déjà existants).
  for (const value of ambianceValues) {
    const tagId = tagIdByValue.get(value)
    if (tagId) {
      await updateProductTagsWorkflow(container).run({
        input: {
          selector: { id: tagId },
          update: { metadata: { color: AMBIANCE_COLORS[value] } },
        },
      })
    }
  }
  logger.info("Couleurs des ambiances synchronisées.")

  // 2. Assignation aux catégories feuilles (par nom).
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })
  const categoryIdByName = new Map<string, string>(
    (categories as { id: string; name: string }[]).map((c) => [c.name, c.id])
  )

  for (const [name, value] of Object.entries(CATEGORY_AMBIANCE)) {
    const categoryId = categoryIdByName.get(name)
    const tagId = tagIdByValue.get(value)
    if (categoryId && tagId) {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: categoryId },
          update: { metadata: { ambiance_tag_id: tagId } },
        },
      })
      logger.info(`Catégorie "${name}" → ambiance "${value}"`)
    } else {
      logger.warn(`Ignoré "${name}" (catégorie ou tag introuvable)`)
    }
  }

  // 3. Surcharge démo : 1re "Bougie classique" → california.
  const bougiesId = categoryIdByName.get(CLASSIC_CANDLES_CATEGORY)
  const californiaId = tagIdByValue.get("california")
  if (bougiesId && californiaId) {
    const { data: cats } = await query.graph({
      entity: "product_category",
      fields: ["id", "products.id", "products.title"],
      filters: { id: bougiesId },
    })
    const prods =
      (cats[0] as { products?: { id: string; title: string }[] } | undefined)
        ?.products ?? []
    const demo = prods[0]
    if (demo) {
      await setProductAmbianceWorkflow(container).run({
        input: { product_id: demo.id, tag_id: californiaId },
      })
      logger.info(`Surcharge démo : produit "${demo.title}" → california`)
    }
  }

  logger.info("Câblage des ambiances terminé.")
}
