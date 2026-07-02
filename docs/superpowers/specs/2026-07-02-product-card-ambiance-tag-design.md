# Afficher l'ambiance (tag + couleur) sur la carte produit

**Date** : 2026-07-02
**Périmètre** : carte produit de la page Collection (`apps/storefront/src/modules/collections/components/product-card.tsx`) + acheminement de la donnée depuis le backend. Header/footer/grille non touchés.
**Source de vérité** : maquettes `Collection.pdf` (chip « RIVIERA • » / « MÉDITERRANÉE • » au-dessus du titre) et `product-card.pdf`.

## Contexte

La carte produit affiche déjà un chip « pastille de couleur + libellé en majuscules » au-dessus du titre (`ambianceLabel` + `ambianceColor`). Mais `to-card-model.ts` **fabrique** cette donnée : le libellé retombe sur le nom de catégorie et la couleur est dérivée par hash depuis une palette figée (`AMBIANCE_PALETTE` / `ambianceColorFor`). Ce n'est pas la vraie ambiance.

Le système « ambiances » du backend **est** le système de tags produit Medusa : chaque tag porte sa couleur dans `metadata.color` (ex. `california` → `#FCA4E0`, `méditerranée` → `#2373EA`). L'ambiance **effective** d'un produit se résout ainsi : sa surcharge (`product.tags[0]`) gagne, sinon l'ambiance héritée de sa 1ʳᵉ catégorie qui en définit une (`category.metadata.ambiance_tag_id`), sinon aucune. Cette logique existe déjà côté backend (`src/lib/ambiance/resolve-ambiance.ts`, `query-ambiance.ts`, route admin `/admin/products/:id/ambiance`).

Décisions validées :
- **Ambiance effective avec héritage** (un seul chip par carte), pas les tags natifs bruts. Colle à la maquette et fonctionne pour les produits dont l'ambiance est héritée de la catégorie (cas majoritaire du seed).
- **Route store batch** pour acheminer `value` + `color` : Medusa strippe les `metadata` des tags/catégories imbriqués sur l'API store REST, donc la résolution se fait côté serveur (query container) où les metadata sont accessibles.

## Modèle de données

Rien de nouveau : on lit les tags produit existants (`product.tags`, `metadata.color`) et `product_category.metadata.ambiance_tag_id`. Réutilisation de la résolution existante.

## Backend

### Logique partagée — `src/lib/ambiance/`
- **`resolve-ambiance.ts`** : `AmbianceTag` gagne `color: string | null`. `resolveProductAmbiance` inchangé dans sa logique (il propage l'objet retenu, donc la couleur suit).
- **`query-ambiance.ts`** :
  - `fetchProductAmbiance` (mono-produit, admin) étendu pour remonter aussi `color` (ajout de `tags.metadata` et `product_tag.metadata` aux `fields`, lecture de `metadata.color`). Les consommateurs admin (widget, route) ne lisent que `value`/`id` → non cassés.
  - **nouvelle** `fetchProductsAmbiances(query, productIds): Promise<Record<string, AmbianceTag | null>>`, en **2 requêtes** quel que soit N : (1) `product` filtré par ids avec `tags.id/value/metadata` + `categories.metadata` ; (2) `product_tag` sur l'ensemble des ids hérités pour hydrater `value` + `color`. Puis `resolveProductAmbiance` par produit.

### Route store — `src/api/store/product-ambiances/route.ts`
`GET /store/product-ambiances?product_ids=a,b,c` → `{ ambiances: { [id]: { value: string; color: string | null } | null } }`. Même style que `collection-layout` (résout via le query container). Accepte `product_ids` en CSV ou répété. Ids absents/inconnus → `null`.

## Storefront

- **`src/lib/data/collection-ambiances.ts`** (`"use server"`) : `getProductAmbiances(ids: string[]): Promise<Record<string, { value: string; color: string | null }>>`. Fetch la route, retombe sur `{}` en cas d'erreur (try/catch, comme `getCollectionLayout`). N'appelle pas si `ids` vide.
- **`to-card-model.ts`** :
  - `CardModel.ambianceLabel` et `ambianceColor` deviennent `string | null`.
  - Suppression de `AMBIANCE_PALETTE` + `ambianceColorFor` (le fake hash disparaît). Suppression de la dérivation catégorie pour l'ambiance.
  - `toCardModel(product, ambiance)` reçoit l'ambiance résolue (`{ value, color } | null`) ; `toCardModels(products, ambianceMap)` lit `ambianceMap[product.id]`. `categoryLabel` conservé (autre champ, inchangé).
- **`collections/page.tsx`** : après le fetch produits, `const ids = products.map(p => p.id)` → `getProductAmbiances(ids)` → passe la map à `toCardModels`. Un seul appel réseau pour toute la grille. La map est construite avant `withHighlightFirst`/`filter(image)`.
- **`product-card.tsx`** : le chip (déjà présent, `h-1.5 w-1.5` = « toute petite pastille ») ne s'affiche **que si** `card.ambianceLabel` est non-null. Pastille avec `backgroundColor: card.ambianceColor`. Visuellement identique à la maquette, alimenté par la vraie donnée ; pas de chip fantôme pour un produit sans ambiance.

## Tests

- **`resolve-ambiance.unit.spec.ts`** : mis à jour pour le champ `color` (les cas existants asserteront `color`).
- **`query-ambiance.unit.spec.ts`** : mono-produit mis à jour (couleur remontée) + nouveaux cas `fetchProductsAmbiances` (override gagne avec sa couleur / héritage catégorie hydraté avec couleur / produit sans ambiance → `null` / batch multi-produits en 2 requêtes).
- Runner : jest `test:unit` (déjà en place, pattern `*.unit.spec.ts`). Pas de test visuel sur le composant (proportionné).

## Hors périmètre

Chips multiples par carte, tags natifs bruts sans héritage, édition de la couleur depuis le storefront, modification de la grille/filtres/hero.
