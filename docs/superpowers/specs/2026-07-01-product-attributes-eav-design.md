# Système d'attributs produit dynamiques (EAV)

**Date :** 2026-07-01
**Statut :** validé
**Remplace :** `2026-07-01-product-editorial-sections-design.md` (les 3 sections fixes
deviennent un cas particulier de ce système). Même branche `feat/product-editorial-sections`,
la PR #2 évolue en « product attributes ».

## Problème

Sur les fiches produit, plusieurs données affichées sont **codées en dur** dans le
templating et identiques pour tous les produits : la ligne d'accroche près du prix
(`GENERIC_NOTES`), la pyramide olfactive (`GENERIC_PYRAMID`), le suffixe « · Cire de
soja », les sections en accordéon, et le bandeau de réassurance `TRUST`.

Le merchant doit pouvoir, depuis l'admin :
- **créer** ses propres champs (attributs),
- les **associer à des catégories** (avec **override par produit**),
- **remplir les valeurs** par produit,
- et gérer un bandeau de **réassurance global** à l'app.

Le storefront n'affiche que les champs applicables à chaque produit. Plus aucune donnée
produit en dur dans le templating.

## Décisions validées

- **Modèle** : EAV 100 % dynamique — les définitions de champs sont créées depuis l'admin.
- **Scoping** : par **catégorie**, avec **override produit** (ajout / masquage).
- **Types de champs (MVP)** : `text`, `textarea`, `group` (sous-champs, ex. pyramide).
- **Zones de rendu** : `accroche` (près du prix), `specs` (grille), `accordeon` (bas de fiche).
- **Valeurs** : stockées dans `product.metadata` (déjà fetché côté storefront).
- **TRUST** : rendu **dynamique mais au niveau global de l'app** (pas par produit) —
  liste `TrustBadge` éditable en admin, appliquée à toutes les fiches.

## Architecture

### 1. Module backend `productAttribute`

`src/modules/product-attribute/` (constante module en **camelCase** : `productAttribute`).

**Model `AttributeDefinition`** (`models/attribute-definition.ts`)

| champ | type | rôle |
|---|---|---|
| `id` | id (pk) | — |
| `key` | text (unique) | slug = clé dans `product.metadata` (`notes`, `pyramide`, `utilisation`…) |
| `label` | text | libellé affiché |
| `type` | enum `text` \| `textarea` \| `group` | nature du champ |
| `zone` | enum `accroche` \| `specs` \| `accordeon` | emplacement sur la fiche |
| `rank` | number (default 0) | ordre d'affichage |
| `group_fields` | json (nullable) | pour `group` : `[{ key: string, label: string }]` |

**Model `TrustBadge`** (`models/trust-badge.ts`) — réassurance globale app

| champ | type | rôle |
|---|---|---|
| `id` | id (pk) | — |
| `icon` | text | glyphe / emoji (ex. « ♻ ») |
| `label` | text | libellé (ex. « Contenant réutilisable ») |
| `rank` | number (default 0) | ordre |

Service : `ProductAttributeModuleService extends MedusaService({ AttributeDefinition, TrustBadge })`.
Enregistrement dans `medusa-config.ts`.

### 2. Module links (`src/links/`)

- `attribute-definition-product-category.ts` : `AttributeDefinition` ↔ `ProductCategory`
  (N-N) — scoping par catégorie.
- `attribute-definition-product.ts` : `AttributeDefinition` ↔ `Product` (N-N) — **ajout**
  ponctuel d'un champ sur un produit précis.

Le **masquage** d'un champ hérité de la catégorie n'utilise pas de lien : il vit dans
`product.metadata.attr_hidden` (`string[]` de `key`).

### 3. Logique de résolution (partagée)

`src/modules/product-attribute/lib/resolve-attributes.ts` — pure, testable :

Entrée : `categoryIds: string[]`, `productDefinitionIds: string[]`,
`allDefinitions`, `metadata`.
Sortie : liste ordonnée de `ResolvedAttribute { key, label, type, zone, rank, value, group_fields }`.

```
applicables = définitions liées à une des categoryIds
            ∪ définitions liées au produit (ajouts)
            − celles dont key ∈ metadata.attr_hidden
tri par (rank, label)
value = metadata[key]  (objet JSON pour un group)
```

La récupération des liens se fait via `query.graph()` (retrieval cross-module).

### 4. Workflows (toute mutation passe par un workflow)

`src/workflows/product-attribute/` :
- `create-attribute-definition.ts` — crée la définition + sync des `category_ids` (links).
- `update-attribute-definition.ts` — met à jour + re-sync des `category_ids`.
- `delete-attribute-definition.ts` — supprime la définition + ses links.
- `set-product-attribute-overrides.ts` — en un seul appel : pose/retire les liens
  produit (ajouts) **et** met à jour `metadata.attr_hidden` (masquage), en réutilisant
  `updateProductsWorkflow` pour la partie metadata. Les **valeurs** des champs passent,
  elles, par le workflow natif `updateProductsWorkflow` (metadata produit) déclenché
  depuis le widget via `sdk.admin.product.update`.
- `upsert-trust-badges.ts` / `delete-trust-badge.ts` — gestion de la liste globale.

Steps colocalisés (`src/workflows/product-attribute/steps/…`) si nécessaire.

### 5. API routes

Méthodes **GET / POST / DELETE uniquement** (jamais PATCH/PUT). Validation Zod via
middlewares (`req.validatedBody` + type inféré).

**Admin**
- `GET  /admin/product-attributes` — liste des définitions (+ catégories liées).
- `POST /admin/product-attributes` — créer.
- `POST /admin/product-attributes/:id` — mettre à jour.
- `DELETE /admin/product-attributes/:id` — supprimer.
- `GET  /admin/products/:id/attributes` — champs résolus pour un produit (édition widget).
- `POST /admin/products/:id/attributes/overrides` — corps
  `{ add_definition_ids?, remove_definition_ids?, hidden_keys? }` : gère en un appel les
  ajouts/retraits de champs et la liste `attr_hidden`.
- `GET/POST /admin/trust-badges`, `DELETE /admin/trust-badges/:id`.

**Store**
- `GET /store/products/:id/attributes` — champs résolus (label, type, zone, value, group_fields).
- `GET /store/trust-badges` — liste globale ordonnée.

### 6. Admin UI

**Page « Attributs produit »** (`src/admin/routes/product-attributes/page.tsx`,
`defineRouteConfig`) :
- table des définitions ; création/édition via **FocusModal** (create) / **Drawer** (edit) :
  `key`, `label`, `type`, `zone`, `rank`, `group_fields` (éditeur de sous-champs si
  `type=group`), multi-select des **catégories**.
- section « Réassurance (global) » : CRUD de la liste `TrustBadge`.

**Widget produit** (refonte de `src/admin/widgets/product-editorial.tsx` →
`product-attributes.tsx`, zone `product.details.after`) :
- charge les champs résolus via `GET /admin/products/:id/attributes` (react-query,
  chargement on mount) ;
- Drawer d'édition : un contrôle par champ selon son `type` (input / textarea /
  sous-champs pour group) ;
- gestion des overrides : **ajouter** un champ hors-catégorie (select parmi toutes les
  définitions), **masquer** un champ hérité ;
- sauvegarde des valeurs → `sdk.admin.product.update(id, { metadata })` (merge) ;
  overrides → `POST /admin/products/:id/attributes/overrides` ;
- invalidation des queries + toasts ; `disabled`/`isLoading` pendant les mutations.

### 7. Storefront

- `pieces.ts` : retirer `GENERIC_NOTES`, `GENERIC_PYRAMID`, le suffixe `matiere` en dur,
  et le champ `sections` figé. Ajouter au flux la récupération des attributs résolus.
- Récupération : `getProductAttributes(id)` et `getTrustBadges()` dans
  `src/lib/data/…` (via `sdk.client.fetch` des routes store).
- `product-template.tsx` : rendu **par zone**
  - `accroche` → ligne près du prix (remplace `piece.notes`) ;
  - `specs` → grille (remplace le bloc pyramide en dur ; un `group` rend la grille
    à N colonnes d'après `group_fields`) ;
  - `accordeon` → `KultProductAccordions` alimenté par les champs de cette zone ;
  - bandeau réassurance → `TrustBadge[]` (remplace la constante `TRUST`).
- `product-accordions.tsx` : déjà piloté par props `sections` (issu de la PR #2) —
  alimenté désormais par les attributs de zone `accordeon`.
- Sections vides / zones vides → **masquées** (règle inchangée).

### 8. Seed de l'existant

`src/scripts/seed-product-attributes.ts` (ou extension du seed) crée les définitions :

| key | label | type | zone | catégories |
|---|---|---|---|---|
| `notes` | Notes | text | accroche | (toutes) |
| `matiere` | Matière | text | specs | (toutes) |
| `pyramide` | Pyramide olfactive | group (tête/cœur/fond) | specs | bougies, parfums |
| `details_matiere` | Détails & matière | textarea | accordeon | (toutes) |
| `utilisation` | Utilisation | textarea | accordeon | (toutes) |
| `livraison_retours` | Livraison & retours | textarea | accordeon | (toutes) |

+ seed des `TrustBadge` par défaut (les 3 badges actuels de `TRUST`).

« (toutes) » = associées à chaque catégorie existante (bougies, bougies-gold, parfums).

## Découpage (mêmes branche + PR, 3 lots de commits)

1. **`feat(backend)`** — module `productAttribute` (models `AttributeDefinition` +
   `TrustBadge`), links, workflows, routes admin/store, migrations, lib de résolution
   (+ test unitaire de `resolve-attributes`).
2. **`feat(admin)`** — page « Attributs produit » (CRUD définitions + catégories +
   réassurance) et refonte du widget produit (valeurs + overrides).
3. **`feat(storefront)`** — data-loaders, rendu par zone, réassurance dynamique,
   suppression du statique, seed des définitions.

## Hors périmètre (YAGNI)

- Pas de type de champ au-delà de `text` / `textarea` / `group` (pas de select, number,
  media… — le modèle EAV permettra de les ajouter plus tard).
- TRUST **par produit** (V2 éventuelle — pour l'instant global app).
- Pas de refonte des autres textes de marque en dur (header, footer, savoir-faire…) —
  hors sujet « données produit ».
- Pas d'i18n des labels (labels saisis tels quels).

## Vérification

- Backend : `pnpm build` (backend) OK ; migrations générées + appliquées ; test unitaire
  de `resolve-attributes` vert.
- Admin : créer une définition `group` (pyramide) scopée « parfums », l'associer, la
  remplir sur un produit parfum ; ajouter/masquer un champ sur un produit ; éditer la
  réassurance.
- Storefront : un produit « parfums » affiche la pyramide en grille + les accordéons
  remplis + l'accroche ; un produit sans valeur n'affiche pas la zone ; le bandeau
  réassurance reflète les `TrustBadge`. Aucune donnée produit en dur restante.
- `tsc --noEmit` OK backend + storefront.

## Git

- Branche : `feat/product-editorial-sections` (existante, PR #2).
- Commits conventionnels (voir découpage). Push + mise à jour de la PR #2 (titre/corps).
