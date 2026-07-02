import { HttpTypes } from "@medusajs/types"

/** Une sous-catégorie (feuille) du filtre. */
export type CategoryFilterChild = {
  handle: string
  label: string
  count?: number
}

/** Une catégorie de 1er niveau, avec ses éventuelles sous-catégories. */
export type CategoryFilterNode = CategoryFilterChild & {
  children: CategoryFilterChild[]
}

type RawCategory = HttpTypes.StoreProductCategory

/** Catégorie technique à ne jamais exposer dans les filtres. */
const EXCLUDED_HANDLES = new Set(["collection"])

const isUsable = (c: { handle?: string | null }): c is { handle: string } =>
  Boolean(c.handle) && !EXCLUDED_HANDLES.has(c.handle as string)

const toChild = (c: RawCategory): CategoryFilterChild => ({
  handle: c.handle as string,
  label: c.name as string,
  count: c.products?.length,
})

/**
 * Construit l'arborescence de filtres (parents + sous-catégories) à partir des
 * catégories renvoyées par l'API. Les nœuds de 1er niveau (sans parent) portent
 * leurs enfants ; le compteur d'un parent agrège ses produits propres + ceux de
 * ses sous-catégories.
 */
export const buildCategoryTree = (
  raw: RawCategory[]
): CategoryFilterNode[] => {
  const topLevel = raw.filter((c) => isUsable(c) && !c.parent_category)

  return topLevel.map((c) => {
    const children = (c.category_children ?? []).filter(isUsable).map(toChild)
    const ownCount = c.products?.length ?? 0
    const childrenCount = children.reduce((sum, ch) => sum + (ch.count ?? 0), 0)
    return {
      handle: c.handle as string,
      label: c.name as string,
      count: ownCount + childrenCount,
      children,
    }
  })
}

/**
 * Map `handle -> ids à filtrer` = la catégorie + tous ses descendants directs.
 * Sélectionner un parent filtre alors sur l'ensemble des produits de ses
 * sous-catégories (Medusa ne remonte pas les descendants automatiquement).
 */
export const buildCategoryIdMap = (
  raw: RawCategory[]
): Map<string, string[]> => {
  const map = new Map<string, string[]>()
  for (const c of raw) {
    if (!isUsable(c)) {
      continue
    }
    const childIds = (c.category_children ?? [])
      .map((ch) => ch.id)
      .filter((id): id is string => Boolean(id))
    map.set(c.handle as string, [c.id, ...childIds])
  }
  return map
}

/** Libellé d'une catégorie OU sous-catégorie par handle (fil d'Ariane). */
export const findCategoryLabel = (
  tree: CategoryFilterNode[],
  handle: string | null
): string | null => {
  if (!handle) {
    return null
  }
  for (const node of tree) {
    if (node.handle === handle) {
      return node.label
    }
    const child = node.children.find((ch) => ch.handle === handle)
    if (child) {
      return child.label
    }
  }
  return null
}
