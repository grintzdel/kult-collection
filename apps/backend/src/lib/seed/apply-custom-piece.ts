import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import {
  CERAMIC_CANDLES_CATEGORY,
  CLASSIC_CANDLES_CATEGORY,
} from "./categories"

/**
 * Contenu éditorial de la section « pièce personnalisée » d'une page produit.
 * Stocké dans `category.metadata.custom_piece` : le contenu est donc rattaché à
 * la CATÉGORIE (tous les produits d'une catégorie partagent la même section).
 * `image` est un chemin d'asset public du storefront.
 */
export type CustomPieceContent = {
  enabled: boolean
  kicker: string
  title: string
  text: string
  cta_label: string
  cta_url: string
  image: string
}

/**
 * Contenu par catégorie feuille (par nom). Une catégorie absente d'ici n'a pas
 * de section : elle est simplement masquée côté storefront. Aujourd'hui, seules
 * les bougies (parfumées) proposent la personnalisation olfactive.
 */
const CUSTOM_PIECE_BY_CATEGORY: Record<string, CustomPieceContent> = {
  [CLASSIC_CANDLES_CATEGORY]: {
    enabled: true,
    kicker: "Sur-mesure",
    title: "Personnalisez votre voyage olfactif",
    text: "Créez une pièce qui vous ressemble en personnalisant votre produit selon vos envies. Choisissez la couleur qui évoque un moment particulier, sélectionnez la senteur qui vous rappelle un lieu ou un souvenir précieux, puis optez pour le pot qui donnera vie à cette histoire. Une création unique, pensée pour faire renaître les souvenirs qui comptent le plus pour vous.",
    cta_label: "Personnaliser mon souvenir",
    cta_url: "/notre-atelier",
    image: "/kult/candle-lavande.png",
  },
  [CERAMIC_CANDLES_CATEGORY]: {
    enabled: true,
    kicker: "Sur-mesure",
    title: "Personnalisez votre voyage olfactif",
    text: "Créez une pièce qui vous ressemble en personnalisant votre bougie céramique selon vos envies. Choisissez la couleur qui évoque un moment particulier, sélectionnez la senteur qui vous rappelle un lieu ou un souvenir précieux, puis optez pour la céramique qui donnera vie à cette histoire. Une création unique, pensée pour faire renaître les souvenirs qui comptent le plus pour vous.",
    cta_label: "Personnaliser mon souvenir",
    cta_url: "/notre-atelier",
    image: "/kult/candle-lavande.png",
  },
}

/**
 * Câblage backend de la section « pièce personnalisée » (idempotent) :
 * pose `metadata.custom_piece` sur chaque catégorie ciblée, en FUSIONNANT avec
 * la metadata existante (ne pas écraser `ambiance_tag_id` posé en amont).
 */
export const applyCustomPieceWiring = async (
  container: MedusaContainer
): Promise<void> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "metadata"],
  })

  const byName = new Map(
    (
      categories as {
        id: string
        name: string
        metadata?: Record<string, unknown> | null
      }[]
    ).map((c) => [c.name, c])
  )

  for (const [name, content] of Object.entries(CUSTOM_PIECE_BY_CATEGORY)) {
    const category = byName.get(name)
    if (!category) {
      logger.warn(`Custom-piece ignoré : catégorie "${name}" introuvable.`)
      continue
    }
    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: category.id },
        update: {
          metadata: { ...(category.metadata ?? {}), custom_piece: content },
        },
      },
    })
    logger.info(`Catégorie "${name}" → section pièce personnalisée.`)
  }

  logger.info("Câblage des sections pièce personnalisée terminé.")
}
