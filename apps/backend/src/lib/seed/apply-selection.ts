import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Collection curée « Composez votre lot » : une sélection de pièces d'art de la
 * table, mise en avant sur chaque page produit pour inviter à composer un lot.
 * Ce n'est PAS du « related » : la sélection est la même partout et se pilote en
 * ajoutant/retirant des produits de cette collection (mécanisme natif Medusa).
 */
export const SELECTION_COLLECTION = {
  title: "Composez votre lot",
  handle: "composez-votre-lot",
}

/**
 * Pièces rattachées à la sélection (par titre exact, tel que dans
 * `data/kult/products.json`). Modifier cette liste = re-curer le lot.
 */
const SELECTION_PRODUCT_TITLES = [
  "Assiette L'Amour au Soleil",
  "Pichet Rayé Bleu",
  "Mug Beach Club",
  "Vide-poche Palmier",
  "Bougeoir Tricolore",
  "Assiette La Bella Vita",
  "Tasse La Dolce Vita",
  "Pichet Cocktail Club",
]

/**
 * Câblage backend de la sélection « Composez votre lot » (idempotent) :
 * 1. assure la collection (créée si absente) ;
 * 2. y rattache les produits ciblés par titre (`collection_id`).
 *
 * Note : ces produits (art de la table) n'ont pas de senteur, donc le
 * scent-selector de leur page produit n'utilise PAS cette collection — il
 * retombe sur la sous-catégorie (cf. la page produit, gate `metadata.senteur`).
 */
export const applySelectionWiring = async (
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
    (c) => c.handle === SELECTION_COLLECTION.handle
  )?.id
  if (!collectionId) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: [SELECTION_COLLECTION] },
    })
    collectionId = (result as { id: string }[])[0].id
    logger.info(`Collection créée : ${SELECTION_COLLECTION.title}`)
  } else {
    logger.info(`Collection déjà existante : ${SELECTION_COLLECTION.title}`)
  }

  // 2. Produits ciblés par titre exact.
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
    pagination: { take: 10000, skip: 0 },
  })
  const wanted = new Set(SELECTION_PRODUCT_TITLES)
  const ids = (products as { id: string; title: string }[])
    .filter((p) => wanted.has(p.title))
    .map((p) => p.id)

  if (ids.length) {
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: ids },
        update: { collection_id: collectionId },
      },
    })
  }

  logger.info(
    `${ids.length}/${SELECTION_PRODUCT_TITLES.length} pièces rattachées à "${SELECTION_COLLECTION.title}".`
  )
}
