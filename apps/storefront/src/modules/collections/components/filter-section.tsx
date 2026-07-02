"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

import { COLLECTION_AMBIANCES } from "../lib/ambiances"
import type { CategoryFilterNode } from "../lib/category-tree"

type FilterSectionProps = {
  categories: CategoryFilterNode[]
  activeCategory: string | null
  activeAmbiance: string | null
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden
    className={`text-ink/40 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`}
  >
    <path
      d="M2.5 4.5 6 8l3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Section = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-ink/10 py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-label text-ink">
          {title}
        </span>
        <Chevron open={open} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  )
}

/**
 * Groupe catégorie dépliant : le parent (Bougies, Vaisselle…) porte un chevron,
 * et déplie « Tout » (tous les produits du parent + descendants) suivi de ses
 * sous-catégories. Ouvert d'office si le filtre actif est le parent ou l'un de
 * ses enfants.
 */
const CategoryGroup = ({
  node,
  activeCategory,
  onSelect,
  itemClass,
}: {
  node: CategoryFilterNode
  activeCategory: string | null
  onSelect: (handle: string) => void
  itemClass: (active: boolean) => string
}) => {
  const containsActive =
    activeCategory === node.handle ||
    node.children.some((ch) => ch.handle === activeCategory)
  const [open, setOpen] = useState(containsActive)

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span
          className={`font-sans text-sm transition-colors ${
            containsActive ? "text-ink" : "text-ink/60 hover:text-ink"
          }`}
        >
          {node.label}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <ul className="mt-2.5 flex flex-col gap-2.5 border-l border-ink/10 pl-3">
          <li>
            <button
              type="button"
              onClick={() => onSelect(node.handle)}
              className={itemClass(activeCategory === node.handle)}
            >
              Tout
            </button>
          </li>
          {node.children.map((child) => (
            <li key={child.handle}>
              <button
                type="button"
                onClick={() => onSelect(child.handle)}
                className={itemClass(activeCategory === child.handle)}
              >
                {child.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Sidebar de filtres de la page Collection (maquette `Collection.pdf`).
 * Catégories & Ambiances = données réelles, pilotent l'URL (`?category=`,
 * `?ambiance=`, filtrage serveur). Couleur / Prix / Disponibilité = à venir.
 */
const FilterSection = ({
  categories,
  activeCategory,
  activeAmbiance,
}: FilterSectionProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Pousse (ou retire) un paramètre de filtre dans l'URL sans scroller.
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const itemClass = (active: boolean) =>
    `block w-full text-left font-sans text-sm transition-colors ${
      active ? "text-terracotta" : "text-ink/60 hover:text-ink"
    }`

  return (
    <aside className="w-full">
      <h2 className="pb-4 font-mono text-[11px] font-medium uppercase tracking-label text-ink">
        Filtres
      </h2>

      <Section title="Catégories">
        <ul className="flex flex-col gap-2.5">
          <li>
            <button
              type="button"
              onClick={() => setParam("category", null)}
              className={itemClass(!activeCategory)}
            >
              Tout
            </button>
          </li>
          {categories.map((cat) =>
            cat.children.length > 0 ? (
              <CategoryGroup
                key={cat.handle}
                node={cat}
                activeCategory={activeCategory}
                onSelect={(handle) => setParam("category", handle)}
                itemClass={itemClass}
              />
            ) : (
              <li key={cat.handle}>
                <button
                  type="button"
                  onClick={() => setParam("category", cat.handle)}
                  className={itemClass(activeCategory === cat.handle)}
                >
                  {cat.label}
                </button>
              </li>
            )
          )}
        </ul>
      </Section>

      <Section title="Ambiances">
        <ul className="flex flex-col gap-2.5">
          <li>
            <button
              type="button"
              onClick={() => setParam("ambiance", null)}
              className={itemClass(!activeAmbiance)}
            >
              Toutes
            </button>
          </li>
          {COLLECTION_AMBIANCES.map((amb) => {
            const active = activeAmbiance === amb.slug
            return (
              <li key={amb.slug}>
                <button
                  type="button"
                  onClick={() =>
                    setParam("ambiance", active ? null : amb.slug)
                  }
                  className={`flex w-full items-center gap-2 text-left font-sans text-sm transition-colors ${
                    active ? "text-terracotta" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: amb.color }}
                  />
                  {amb.label}
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Couleur" defaultOpen={false}>
        <p className="font-sans text-xs text-ink/30">Bientôt disponible</p>
      </Section>

      <Section title="Prix" defaultOpen={false}>
        <p className="font-sans text-xs text-ink/30">Bientôt disponible</p>
      </Section>

      <Section title="Disponibilité" defaultOpen={false}>
        <p className="font-sans text-xs text-ink/30">Bientôt disponible</p>
      </Section>
    </aside>
  )
}

export default FilterSection
