import { Metadata } from "next"

import { getCollectionLayout } from "@lib/data/collection-layout"
import { getProductAmbiances } from "@lib/data/collection-ambiances"
import { getProductBadges } from "@lib/data/product-badges"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getProContext } from "@lib/data/pro"
import CollectionListTemplate from "@modules/collections/templates/collection-list-template"
import {
  toCardModels,
  withHighlightFirst,
} from "@modules/collections/lib/to-card-model"
import {
  findAmbianceBySlug,
  matchesAmbiance,
} from "@modules/collections/lib/ambiances"
import {
  buildCategoryIdMap,
  buildCategoryTree,
  findCategoryLabel,
} from "@modules/collections/lib/category-tree"

export const metadata: Metadata = {
  title: "La collection",
  description:
    "Toutes les pièces de la maison KULT — bougies, parfums et objets, coulés et parfumés à la main.",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string; ambiance?: string }>
}

export default async function CollectionsPage(props: Props) {
  const { countryCode } = await props.params
  const { category: activeCategory = null, ambiance: ambianceSlug = null } =
    await props.searchParams
  const activeAmbiance = findAmbianceBySlug(ambianceSlug)

  // Catégories réelles (arborescence parent → sous-catégories) pour la sidebar.
  const categoriesRaw = await listCategories({
    fields:
      "id,name,handle,parent_category.id,category_children.id,category_children.name,category_children.handle,category_children.products.id,products.id",
  }).catch(() => [])

  const categories = buildCategoryTree(categoriesRaw)
  // Sélectionner un parent doit filtrer sur tous ses descendants (Medusa ne les
  // remonte pas), d'où la résolution handle → [id parent, ...ids enfants].
  const categoryIdMap = buildCategoryIdMap(categoriesRaw)
  const activeCategoryIds = activeCategory
    ? categoryIdMap.get(activeCategory)
    : undefined

  // Produits (filtrés par catégorie côté serveur si demandé).
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
      fields:
        "*variants.calculated_price,*variants.options,*options,*categories,+metadata",
      ...(activeCategoryIds?.length ? { category_id: activeCategoryIds } : {}),
    },
  })

  const [layout, ambianceMap, badges, proContext] = await Promise.all([
    getCollectionLayout(),
    getProductAmbiances(products.map((p) => p.id)),
    getProductBadges(),
    getProContext(countryCode),
  ])

  // Filtre ambiance (côté serveur) : l'ambiance effective est résolue par
  // produit (surcharge sinon héritage catégorie), on ne garde que les pièces
  // dont l'ambiance correspond à la sélection.
  const filteredProducts = activeAmbiance
    ? products.filter((p) =>
        matchesAmbiance(ambianceMap[p.id]?.value, activeAmbiance)
      )
    : products

  // Cartes : on écarte les pièces sans photo (ex. anciens aplats de couleur),
  // et on remonte la pièce mise en avant en tête (1ʳᵉ ligne, seule).
  const cards = withHighlightFirst(
    toCardModels(filteredProducts, ambianceMap, {
      isPro: proContext.isPro,
      config: proContext.config,
      vatRate: proContext.vatRate,
    }).filter((c) => c.image)
  )

  const activeCategoryLabel = findCategoryLabel(categories, activeCategory)

  return (
    <CollectionListTemplate
      cards={cards}
      categories={categories}
      activeCategory={activeCategory}
      activeCategoryLabel={activeCategoryLabel}
      activeAmbiance={activeAmbiance?.slug ?? null}
      activeAmbianceLabel={activeAmbiance?.label ?? null}
      layout={layout}
      countryCode={countryCode}
      badges={badges}
    />
  )
}
