import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Noms des catégories FEUILLES qui portent les produits. Exposés en constantes
 * car d'autres seeds (ambiances, senteurs) les ciblent par nom.
 */
export const CLASSIC_CANDLES_CATEGORY = "Bougie classique"
export const CERAMIC_CANDLES_CATEGORY = "Bougie céramique"
/** Art de la table en faïence (tasses, assiettes…) — distincte des bougies céramique. */
export const TABLEWARE_CATEGORY = "Art de la table"

type ChildNode = { name: string; dataKey?: string; description: string }
type TopNode = {
  name: string
  description: string
  dataKey?: string
  children?: ChildNode[]
}

/**
 * Arborescence du catalogue. `dataKey` = valeur du champ `category` dans
 * `data/kult/products.json` ; il pointe vers la catégorie FEUILLE où rattacher
 * les produits. Le nœud parent "Bougies" ne porte pas de produit : il regroupe
 * "Bougie classique" (senteurs) et "Bougie céramique" (modèles).
 */
export const CATEGORY_TREE: TopNode[] = [
  {
    name: "Bougies",
    description:
      "Toutes nos bougies : bougies parfumées classiques et bougies céramique.",
    children: [
      {
        name: CLASSIC_CANDLES_CATEGORY,
        dataKey: "Bougies",
        description:
          "Bougies parfumées artisanales en cire de soja 100 % naturelle, fabriquées à la main dans le sud de la France.",
      },
      {
        name: CERAMIC_CANDLES_CATEGORY,
        dataKey: "Bougies Gold",
        description:
          "Bougies en céramique émaillée coulées à la main, cire de soja 100 % naturelle et parfums de Grasse.",
      },
    ],
  },
  {
    // `dataKey: "Parfums"` (valeur dans products.json) rattache les diffuseurs à
    // cette catégorie dédiée — l'ancien nom « Parfums » disparaît.
    name: "Diffuseurs",
    dataKey: "Parfums",
    description:
      "Diffuseurs et parfums de maison sans alcool, 100 % biodégradables, parfums de Grasse.",
  },
  {
    // Gamelles pour chiens & chats : catégorie à part, hors « Art de la table ».
    name: "Gamelles",
    dataKey: "Gamelles",
    description:
      "Gamelles en faïence peintes à la main pour chiens et chats, collection Riviera.",
  },
  {
    name: TABLEWARE_CATEGORY,
    dataKey: "Céramiques",
    description:
      "Vaisselle et objets en faïence peints à la main, collection Riviera : tasses, assiettes, pichets, bougeoirs.",
    children: [
      {
        name: "Assiette",
        description:
          "Assiettes en faïence peintes à la main, collection Riviera.",
      },
      {
        name: "Tasse",
        description: "Tasses en faïence peintes à la main, collection Riviera.",
      },
      {
        name: "Mug",
        description: "Mugs en faïence peints à la main, collection Riviera.",
      },
    ],
  },
]

/**
 * Crée l'arborescence de catégories (parents puis enfants avec
 * `parent_category_id`) et retourne le mapping
 * `products.json category (dataKey)` -> id de la catégorie FEUILLE.
 */
export const seedCategoryTree = async (
  container: MedusaContainer
): Promise<Map<string, string>> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Passe 1 : nœuds de premier niveau (parents + feuilles top-level).
  const { result: topCats } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: CATEGORY_TREE.map((n) => ({
        name: n.name,
        description: n.description,
        is_active: true,
      })),
    },
  })
  const topIdByName = new Map(
    (topCats as { id: string; name: string }[]).map((c) => [c.name, c.id])
  )

  const dataKeyToLeafId = new Map<string, string>()
  for (const node of CATEGORY_TREE) {
    if (node.dataKey) {
      dataKeyToLeafId.set(node.dataKey, topIdByName.get(node.name)!)
    }
  }

  // Passe 2 : enfants, rattachés à leur parent.
  const childInput = CATEGORY_TREE.flatMap((node) =>
    (node.children ?? []).map((child) => ({
      name: child.name,
      description: child.description,
      is_active: true,
      parent_category_id: topIdByName.get(node.name)!,
    }))
  )
  if (childInput.length) {
    const { result: childCats } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: { product_categories: childInput },
    })
    const childIdByName = new Map(
      (childCats as { id: string; name: string }[]).map((c) => [c.name, c.id])
    )
    for (const node of CATEGORY_TREE) {
      for (const child of node.children ?? []) {
        if (child.dataKey) {
          dataKeyToLeafId.set(child.dataKey, childIdByName.get(child.name)!)
        }
      }
    }
  }

  logger.info(
    `Arborescence catégories créée (${topCats.length} racines, ${childInput.length} sous-catégories).`
  )
  return dataKeyToLeafId
}

/**
 * Map `nom de sous-catégorie (lowercase) -> id`, restreinte aux catégories
 * ENFANTS (qui ont un `parent_category_id`). Sert à l'assignation dynamique
 * parent + enfant : aucun nom en dur, on s'aligne sur l'arborescence réelle.
 */
export const querySubCategoryIdByName = async (
  container: MedusaContainer
): Promise<Map<string, string>> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "parent_category_id"],
    pagination: { take: 10000, skip: 0 },
  })
  return new Map(
    (data as { id: string; name: string; parent_category_id: string | null }[])
      .filter((c) => c.parent_category_id)
      .map((c) => [c.name.toLowerCase(), c.id])
  )
}

/**
 * `category_ids` d'un produit : sa catégorie primaire (via `dataKey`) + la
 * sous-catégorie dont le NOM correspond au premier mot de son titre
 * (« Tasse … » → aussi rattaché à la sous-catégorie « Tasse »). Un produit est
 * ainsi dans le parent ET l'enfant, sans mapping en dur — dès qu'on ajoute une
 * sous-catégorie nommée comme un type, les produits s'y rattachent tout seuls.
 */
export const resolveProductCategoryIds = (
  productName: string,
  productCategory: string,
  categoryIdByDataKey: Map<string, string>,
  subCategoryIdByName: Map<string, string>
): string[] => {
  const primary = categoryIdByDataKey.get(productCategory)
  const ids = primary ? [primary] : []
  const lead = productName.trim().split(/\s+/)[0]?.toLowerCase()
  const sub = lead ? subCategoryIdByName.get(lead) : undefined
  if (sub && sub !== primary) {
    ids.push(sub)
  }
  return ids
}
