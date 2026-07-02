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

### Associations

- **Produit → tag (surcharge)** : relation **native** `product.tags` (many-to-many). Le
  tag d'un produit représente son ambiance **surchargée**. La contrainte « une seule »
  est imposée par le workflow d'assignation (assigner remplace l'ensemble des tags du
  produit).
- **Catégorie → tag (héritage)** : stocké dans le champ **natif**
  `product_category.metadata.ambiance_tag_id` (l'id du tag). Une seule valeur par
  catégorie → contrainte « une seule ambiance » gratuite.

> **Pourquoi pas un module link catégorie↔tag ?** `product_tag` et `product_category`
> appartiennent tous les deux au module Product natif. Un `defineLink` entre deux
> entités du **même** module donne, côté `link.create`, deux clés identiques
> (`Modules.PRODUCT`) qui entrent en collision. Les liens inter-modules sont conçus pour
> relier des modules **différents**. On utilise donc le champ `metadata` natif de la
> catégorie — robuste, pas de migration de lien, pas de table intermédiaire.

> ⚠️ **Hypothèse assumée** : réutiliser les tags natifs signifie qu'assigner une ambiance
> à un produit **remplace tous ses tags**. Les tags ne servent à rien d'autre dans cette
> boutique, donc c'est sans risque ici.

## Résolution (surcharge → héritage)

Fonction pure `src/lib/ambiance/resolve-ambiance.ts`, sans dépendance framework, testable
indépendamment. Utilisée côté admin (le widget affiche l'ambiance héritée).

```typescript
export type AmbianceTag = { id: string; value: string }

/**
 * Ambiance effective d'un produit : sa surcharge (1er tag) gagne ; sinon l'ambiance
 * héritée de sa catégorie ; sinon null.
 * @param productTags les tags natifs du produit (`product.tags`)
 * @param categoryAmbiance l'ambiance de la catégorie, déjà hydratée (id + value)
 */
export const resolveProductAmbiance = (
  productTags: AmbianceTag[] | null | undefined,
  categoryAmbiance: AmbianceTag | null | undefined
): AmbianceTag | null => {
  const override = productTags?.[0]
  if (override) {
    return { id: override.id, value: override.value }
  }
  return categoryAmbiance ?? null
}
```

Helper de requête `src/lib/ambiance/query-ambiance.ts` : pour un produit, récupère ses
`tags` + `categories.metadata` via `query.graph()`, lit `metadata.ambiance_tag_id` de la
1re catégorie qui en a un, hydrate ce tag (id → value), puis appelle
`resolveProductAmbiance`.

## Workflows (toute mutation passe par un workflow — règle Medusa)

Tags (natifs, `@medusajs/medusa/core-flows`) :

- `createProductTagsWorkflow` — créer une ambiance.
- `updateProductTagsWorkflow` — renommer.
- `deleteProductTagsWorkflow` — supprimer.

Assignation (custom, `src/workflows/ambiance/`) :

- `set-category-ambiance.ts` → `setCategoryAmbianceWorkflow`
  - Entrée : `{ category_id, tag_id: string | null }`.
  - Étape : `updateProductCategoriesWorkflow` en écrivant
    `metadata: { ambiance_tag_id: tag_id }` (ou `null` pour retirer). La fusion de
    metadata est gérée par le workflow natif.
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
- `POST /admin/product-categories/:id/ambiance` — assigner à une catégorie
  `{ tag_id: string | null }` → `setCategoryAmbianceWorkflow`.
- `GET /admin/products/:id/ambiance` — ambiance effective résolue (pour le widget).
- `POST /admin/products/:id/ambiance` — surcharge produit `{ tag_id: string | null }`
  → `setProductAmbianceWorkflow`.

> **Assignation RESTful, pas d'endpoint `assign` global.** Une route
> `/admin/ambiances/assign` en POST entrerait en collision avec la route de mise à jour
> `/admin/ambiances/:id` en POST (même méthode, `:id` capterait `assign`) au niveau des
> middlewares. On imbrique donc l'assignation sous la ressource ciblée (catégorie /
> produit), comme le fait déjà `products/[id]/attributes/`.

Fichiers :

```
src/api/admin/ambiances/
├── middlewares.ts        # schémas Zod + enregistrement des matchers
├── route.ts              # GET (liste) + POST (create)
└── [id]/route.ts         # POST (update) + DELETE
src/api/admin/products/[id]/ambiance/route.ts            # GET (résolu) + POST (surcharge)
src/api/admin/product-categories/[id]/ambiance/route.ts  # POST (assignation catégorie)
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
2. Écrire l'ambiance de chaque catégorie dans sa `metadata.ambiance_tag_id`
   (via `updateProductCategoriesWorkflow`) :
   - Bougies → `cozy`
   - Bougies Gold → `california`
   - Parfums → `méditerranée`
   - Céramiques → `palm beach`
3. (Démo) surcharger un produit avec une ambiance différente de sa catégorie en passant
   `tag_ids: [<id>]` à la création du produit (ou via `setProductAmbianceWorkflow`).

## Tests

- **Unitaire** `resolve-ambiance` : surcharge produit gagne ; sinon héritage de la
  catégorie ; sinon `null` ; produit sans tag ni catégorie → `null`.
- **Build** `npm run build` après implémentation (types + workflows).
- Vérif manuelle du flux admin (créer une ambiance, l'assigner à une catégorie, la
  surcharger sur un produit).

## Hors scope (itérations futures)

- Route store `GET /store/products/:id/ambiance` et affichage storefront.
- Filtrage des collections par ambiance (potentiellement via `query.index()`).
