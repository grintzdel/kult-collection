# Ambiances produit (tags natifs) — Conception

**Date :** 2026-07-02
**Statut :** Validé
**Scope :** Backend + Admin + Seed (pas de storefront pour cette itération)

## Objectif

Permettre d'attribuer une « ambiance » (california, palm beach, cozy, méditerranée) à
une **catégorie** ou à un **produit**. L'ambiance définie au niveau de la catégorie
s'applique par héritage à ses produits ; un produit peut **surcharger** cette ambiance.

Décisions validées lors du brainstorming :

- **Réutiliser les tags produit natifs** de Medusa (`product_tag`), pas de nouvelle table.
- **Une seule ambiance** par catégorie et par produit (single-select).
- **Surcharge (replace)** : si un produit a sa propre ambiance, elle remplace celle de
  la catégorie. Un produit sans ambiance hérite de celle de sa catégorie.
- **Itération limitée au back + admin** : aucune route store ni affichage storefront.

## Modèle de données

Aucun modèle custom. On s'appuie sur `product_tag` (module Product natif) :

- `product_tag.value` porte le nom de l'ambiance (`california`, etc.).

### Liens

- **Produit → tag** : relation native `product.tags` (many-to-many). Le tag d'un produit
  représente son ambiance **surchargée**. La contrainte « une seule » est imposée par le
  workflow d'assignation (assigner remplace l'ensemble des tags du produit).
- **Catégorie → tag** : **nouveau module link**
  `src/links/product-category-product-tag.ts`.

  ```typescript
  import { defineLink } from "@medusajs/framework/utils"
  import ProductModule from "@medusajs/medusa/product"

  // Une catégorie a AU PLUS un tag ; un tag peut être réutilisé sur N catégories.
  export default defineLink(
    {
      linkable: ProductModule.linkable.productCategory,
      isList: true,
    },
    ProductModule.linkable.productTag
  )
  ```

  La forme du lien (catégorie = côté liste, tag = côté simple) garantit **une ambiance
  par catégorie** au niveau du schéma, tout en autorisant le partage d'un tag entre
  plusieurs catégories.

> ⚠️ **Hypothèse assumée** : réutiliser les tags natifs signifie qu'assigner une ambiance
> à un produit **remplace tous ses tags**. Les tags ne servent à rien d'autre dans cette
> boutique, donc c'est sans risque ici.

## Résolution (surcharge → héritage)

Fonction pure `src/lib/ambiance/resolve-ambiance.ts`, sans dépendance framework, testable
indépendamment. Utilisée côté admin (le widget affiche l'ambiance héritée).

```typescript
export type Ambiance = { id: string; value: string }

export type ProductAmbianceInput = {
  tags?: { id: string; value: string }[] | null
  categories?: { product_tags?: { id: string; value: string }[] | null }[] | null
}

/** Ambiance effective : surcharge produit, sinon héritée de la 1re catégorie, sinon null. */
export const resolveProductAmbiance = (
  product: ProductAmbianceInput
): Ambiance | null => {
  const override = product.tags?.[0]
  if (override) {
    return { id: override.id, value: override.value }
  }
  for (const category of product.categories ?? []) {
    const inherited = category.product_tags?.[0]
    if (inherited) {
      return { id: inherited.id, value: inherited.value }
    }
  }
  return null
}
```

Helper de requête `src/lib/ambiance/query-ambiance.ts` : récupère un produit avec
`tags` + `categories.product_tags` en un seul `query.graph()`.

## Workflows (toute mutation passe par un workflow — règle Medusa)

Tags (natifs, `@medusajs/medusa/core-flows`) :

- `createProductTagsWorkflow` — créer une ambiance.
- `updateProductTagsWorkflow` — renommer.
- `deleteProductTagsWorkflow` — supprimer.

Assignation (custom, `src/workflows/`) :

- `set-category-ambiance.ts` → `setCategoryAmbianceWorkflow`
  - Entrée : `{ category_id, tag_id: string | null }`.
  - Étape : dismiss le lien tag↔catégorie existant, puis create le nouveau (ou rien si
    `tag_id` est `null`). Ordre des modules conforme au `defineLink`.
- `set-product-ambiance.ts` → `setProductAmbianceWorkflow`
  - Entrée : `{ product_id, tag_id: string | null }`.
  - Étape : `updateProductsWorkflow` avec `tag_ids: [tag_id]` (ou `[]` pour retirer la
    surcharge et revenir à l'héritage catégorie).

## Routes API (admin uniquement)

Toutes protégées (`AuthenticatedMedusaRequest`), méthodes GET / POST / DELETE
uniquement, validation Zod via middlewares, logique dans les workflows.

- `GET /admin/ambiances` — liste des ambiances (tags) avec compteurs d'usage
  (nb de catégories, nb de produits qui surchargent).
- `POST /admin/ambiances` — créer `{ value }`.
- `POST /admin/ambiances/:id` — renommer `{ value }`.
- `DELETE /admin/ambiances/:id` — supprimer.
- `POST /admin/ambiances/assign` — assigner
  `{ target_type: "category" | "product", target_id: string, tag_id: string | null }`.
  Dispatch vers `setCategoryAmbianceWorkflow` ou `setProductAmbianceWorkflow`.

Fichiers :

```
src/api/admin/ambiances/
├── middlewares.ts        # schémas Zod + validation
├── route.ts              # GET (liste) + POST (create)
├── [id]/route.ts         # POST (update) + DELETE
└── assign/route.ts       # POST (assignation catégorie/produit)
```

## UI Admin

Réutilise `sdk.client.fetch(...)` (jamais `fetch` nu), React Query, composants `@medusajs/ui`.

- **Page sidebar « Ambiances »** — `src/admin/routes/ambiances/page.tsx`
  - `defineRouteConfig({ label: "Ambiances", icon: Swatch })` (icône `Swatch` de
    `@medusajs/icons` ; `Tag` est déjà pris par la page Attributs produit) → nouvel item
    de menu.
  - Tableau des ambiances : valeur, nb catégories, nb produits surchargés, actions
    (modifier / supprimer).
  - Formulaire création/édition (Drawer ou FocusModal) : un champ `value`.
  - Tableau d'assignation catégories : chaque catégorie avec un `Select` d'ambiance
    (option « — Aucune — » pour clear). Change → `POST /admin/ambiances/assign`.
- **Widget fiche produit** — `src/admin/widgets/product-ambiance.tsx`
  - Zone `product.details.side.after`.
  - `Select` : « Hériter de la catégorie (X) » par défaut + une option par ambiance.
  - Change → `POST /admin/ambiances/assign` avec `target_type: "product"`.

Types partagés (nommage/valeurs) dans
`src/admin/components/ambiances/types.ts` si nécessaire.

## Seed

Dans `src/migration-scripts/initial-data-seed.ts`, après la création des catégories :

1. Créer les 4 tags via `createProductTagsWorkflow` :
   `california`, `palm beach`, `cozy`, `méditerranée`.
2. Lier les tags aux catégories (via `link.create`, ordre conforme au `defineLink`) :
   - Bougies → `cozy`
   - Bougies Gold → `california`
   - Parfums → `méditerranée`
   - Céramiques → `palm beach`
3. (Démo) surcharger un produit avec une ambiance différente de sa catégorie via
   `tag_ids` à la création, ou un `link.create` produit↔tag.

## Tests

- **Unitaire** `resolve-ambiance` : surcharge produit gagne ; sinon héritage de la
  catégorie ; sinon `null` ; produit sans tag ni catégorie → `null`.
- **Build** `npm run build` après implémentation (types + workflows).
- Vérif manuelle du flux admin (créer une ambiance, l'assigner à une catégorie, la
  surcharger sur un produit).

## Hors scope (itérations futures)

- Route store `GET /store/products/:id/ambiance` et affichage storefront.
- Filtrage des collections par ambiance (potentiellement via `query.index()`).
