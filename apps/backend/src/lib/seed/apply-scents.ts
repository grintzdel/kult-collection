import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { CLASSIC_CANDLES_CATEGORY } from "./categories"

/**
 * Collection native regroupant tous les produits-senteurs de la gamme bougies.
 * Chaque senteur reste un PRODUIT à part entière ; la collection exprime la
 * relation "même gamme" au niveau backend.
 */
export const SCENTED_COLLECTION = {
  title: "Bougies parfumées",
  handle: "bougies-parfumees",
}

/** Extrait la senteur du nom d'une bougie ("Bougie Violette" -> "Violette"). */
export const parseScent = (name: string): string =>
  name.replace(/^Bougie\s+/i, "").trim()

/**
 * Câblage backend des senteurs (idempotent, non destructif) :
 * 1. assure la collection "Bougies parfumées" (créée si absente) ;
 * 2. y rattache tous les produits de la catégorie "Bougies" ;
 * 3. structure la senteur dans `product.metadata.senteur` (fusionnée avec la
 *    metadata existante, sans l'écraser).
 *
 * Rejouable : ne recrée pas la collection, réapplique juste les rattachements.
 */
export const applyScentWiring = async (
  container: MedusaContainer
): Promise<void> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // 1. Collection (créée si absente).
  const { data: cols } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  let collectionId = (cols as { id: string; handle: string }[]).find(
    (c) => c.handle === SCENTED_COLLECTION.handle
  )?.id
  if (!collectionId) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: [SCENTED_COLLECTION] },
    })
    collectionId = (result as { id: string }[])[0].id
    logger.info(`Collection créée : ${SCENTED_COLLECTION.title}`)
  } else {
    logger.info(`Collection déjà existante : ${SCENTED_COLLECTION.title}`)
  }

  // 2. Produits de la catégorie "Bougies".
  const { data: cats } = await query.graph({
    entity: "product_category",
    fields: ["name", "products.id", "products.title", "products.metadata"],
  })
  const bougies =
    (
      cats as {
        name: string
        products?: {
          id: string
          title: string
          metadata?: Record<string, unknown> | null
        }[]
      }[]
    ).find((c) => c.name === CLASSIC_CANDLES_CATEGORY)?.products ?? []

  // 3. Rattachement à la collection + senteur structurée.
  for (const p of bougies) {
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: p.id },
        update: {
          collection_id: collectionId,
          metadata: { ...(p.metadata ?? {}), senteur: parseScent(p.title) },
        },
      },
    })
  }

  logger.info(
    `${bougies.length} bougies rattachées à "${SCENTED_COLLECTION.title}" + senteur structurée.`
  )
}
