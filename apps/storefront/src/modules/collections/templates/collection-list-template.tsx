import LocalizedClientLink from "@modules/common/components/localized-client-link"

import type { ProductBadges } from "@lib/data/product-badges"
import type { LayoutPattern } from "../lib/chunk-by-pattern"
import type { CardModel } from "../lib/to-card-model"
import CollectionGrid from "../components/collection-grid"
import FilterSection from "../components/filter-section"
import type { CategoryFilterNode } from "../lib/category-tree"

type CollectionListTemplateProps = {
  cards: CardModel[]
  categories: CategoryFilterNode[]
  activeCategory: string | null
  activeCategoryLabel: string | null
  activeAmbiance: string | null
  activeAmbianceLabel: string | null
  layout: LayoutPattern
  countryCode: string
  badges?: ProductBadges
}

/**
 * Page Collection KULT — maquette `Collection.png` : sidebar de filtres à
 * gauche, grille à layout variable (1 / 4 / 3) à droite, traits verts.
 */
const CollectionListTemplate = ({
  cards,
  categories,
  activeCategory,
  activeCategoryLabel,
  activeAmbiance,
  activeAmbianceLabel,
  layout,
  countryCode,
  badges,
}: CollectionListTemplateProps) => {
  // Fil d'Ariane piloté par les filtres actifs : « Collection · Bougies »,
  // « Collection · Bougies & Cozy », etc.
  const selection = [activeCategoryLabel, activeAmbianceLabel]
    .filter(Boolean)
    .join(" & ")

  return (
    <section className="bg-ivory">
      <div className="kult-container py-10 small:py-14">
        <div className="flex flex-col gap-10 small:flex-row small:items-start small:gap-14">
          {/* Colonne gauche sticky : fil d'Ariane + filtres suivent le scroll
              ensemble, dans la largeur de la sidebar (pas de bandeau pleine
              largeur). */}
          <div className="w-full small:sticky small:top-20 small:w-52 small:shrink-0 small:self-start">
            <nav className="mb-8 font-mono text-[11px] uppercase leading-relaxed tracking-label text-ink/40">
              <LocalizedClientLink
                href="/"
                className="transition-colors hover:text-ink"
              >
                Kult collection
              </LocalizedClientLink>
              <span className="mx-2 text-terracotta">·</span>
              {selection ? (
                <>
                  <LocalizedClientLink
                    href="/collections"
                    className="transition-colors hover:text-ink"
                  >
                    Collection
                  </LocalizedClientLink>
                  <span className="mx-2 text-terracotta">·</span>
                  <span className="text-terracotta">{selection}</span>
                </>
              ) : (
                <span className="text-terracotta">Collection</span>
              )}
            </nav>

            <FilterSection
              categories={categories}
              activeCategory={activeCategory}
              activeAmbiance={activeAmbiance}
            />
          </div>
          <div className="min-w-0 flex-1">
            <CollectionGrid
              cards={cards}
              layout={layout}
              countryCode={countryCode}
              badges={badges}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollectionListTemplate
