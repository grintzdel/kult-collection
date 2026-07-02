# Redesign page Collection — fidèle à la maquette KULT

**Date** : 2026-07-02
**Périmètre** : storefront `/collections` (liste globale) + données seed + widget admin. Header/footer non touchés.
**Source de vérité** : `KULT Collection.pdf` (export maquette du projet), PAS la PNG « assiettes » du premier brief.

## Contexte

Le storefront est le starter Medusa Next.js re-skinné avec un design system « KULT » (`tailwind.config.js` + `styles/globals.css` : palette ivory/ink/terracotta/soleil/marine/rose, serif + mono, `motif-damier`, `tex-diagonal`, `badge`, `halo-soleil`). La page `/collections` existe déjà (`app/[countryCode]/(main)/collections/page.tsx`) et compose `KultCollectionHero` + `KultCollectionGrid` + `KultCommentChoisir` + `KultNewsletter`. Le hero et la section « Comment choisir » **matchent déjà la maquette**. On refactore la **grille + les filtres + la carte** pour coller à la maquette et devenir pilotés par la donnée.

Décisions produit (validées) :
- Suivre la maquette **à la lettre** : grille 4 colonnes, filtres en **pills** (Tout/Unis/Motifs/Édition), cartes **sans photo** (aplat couleur ou motif). Pas de layout variable, pas de produit highlight, pas de sidebar, pas de badge NEW.
- **Modifier le seed** pour produire les pièces de la maquette (rangées par couleur/motif).
- « Customizable côté BO » = l'apparence de la carte est **pilotée par metadata**, éditable via un widget admin.

## Modèle de données

Les pièces de la collection sont des produits Medusa portant, dans `product.metadata`, les clés :

| clé | type | rôle |
|---|---|---|
| `couleur` | `{ hex: string, label: string }` | aplat de fond + libellé du chip (ex. `{ hex:"#E7A93A", label:"Soleil" }`). `null`/absent pour les pièces à motif |
| `piece_kind` | `"unis" \| "motifs" \| "edition"` | pilote le filtre pills ET le rendu (aplat vs motif) |
| `motif` | `"damier" \| "leopard" \| "rayures"` | motif de fond quand `piece_kind = "motifs"` |
| `contenant` | `string` | légende mono centrée sur la carte (ex. `"CONTENANT JAUNE SOLEIL"`) |
| `parfum` | `string` | sous-ligne sous le titre (ex. `"Néroli & figue"`). Fallback sur l'attribut existant `notes` |

- Format (`220g`) : lu depuis l'option de variante `Format` (déjà seedée), fallback `"220g"`.
- Prix : depuis le variant (`calculated_price`), affiché via `formatPrice` (montants stockés tels quels : 48 = 48 €).
- Sélection des pièces de la page : une **catégorie dédiée « Collection »** (handle `collection`). La page fetch les produits de cette catégorie → exactement les 6 pièces. Le catalogue existant (93 produits) reste intact pour `/store` et `/products`.

Aucune route store custom (le fetch produits renvoie déjà `+metadata`). Aucun changement de thème (motifs + textures déjà présents ; les aplats unis passent par un `style` inline sur `couleur.hex`).

## Seed (backend)

Nouveau script `src/migration-scripts/seed-collection-pieces.ts` (idempotent, même forme que `seed-product-attributes.ts`) :
1. Crée la catégorie « Collection » si absente.
2. Crée (ou met à jour) les **6 pièces** ci-dessous, format 220g, dans cette catégorie, avec le `metadata` couleur/kind/motif/contenant/parfum.

| Pièce | kind | couleur.hex | prix | parfum | contenant |
|---|---|---|---|---|---|
| Soleil | unis | #E7A93A | 48 | Néroli & figue | CONTENANT JAUNE SOLEIL |
| Terracotta | unis | #C45A3C | 48 | Tabac & ambre | CONTENANT TERRACOTTA |
| Marine | unis | #234A54 | 48 | Sel & cyprès | CONTENANT BLEU MARINE |
| Olive | unis | #6E7B4E | 48 | Sauge & lavande | CONTENANT VERT OLIVE |
| Damier | motifs (`damier`) | — | 54 | Bergamote & cèdre | CONTENANT DAMIER |
| Amore | edition | #DE8C76 | 48 | Rose & oud | CONTENANT ROSE AMORE |

Répartition des filtres : Unis (4), Motifs (1), Édition (1) → chaque pill a au moins une pièce.

## Widget admin

`src/admin/widgets/collection-piece.tsx` (zone `product.details.after`, même pattern que `product-attributes.tsx`, `sdk.admin.product.update(id, { metadata })`) :
- couleur : hex + label
- `piece_kind` : select (unis/motifs/édition)
- `motif` : select (damier/léopard/rayures), visible si kind = motifs
- `contenant` : input
- `parfum` : input

## Storefront (`src/modules/collections/`)

- **`lib/to-piece-card.ts`** (pur, testé) :
  - `type PieceCardModel` (handle, name, price, parfum, format, kind, colorHex, motifClass, contenant, textOnDark, href).
  - `toPieceCard(product)` : mappe `StoreProduct → PieceCardModel`. Calcule `textOnDark` par luminance du hex (aplat foncé → texte ivory ; clair/motif → texte ink).
  - `PIECE_FILTERS` = `[all, unis, motifs, edition]`, `type PieceFilterKey`.
  - `filterPiecesByType(pieces, type)` : pur, `all` = tout, sinon `p.kind === type`.
- **`components/product-card.tsx`** (pur, props in) : carte carrée `rounded-large shadow-soft` hover `-translate-y`, fond = `style backgroundColor: colorHex` (unis) ou classe motif (`motif-damier`…), overlay `tex-diagonal`, chip crème haut-gauche (`couleur.label`), légende mono centrée basse (`contenant`), puis titre serif + prix mono terracotta + sous-ligne `parfum · format`.
- **`components/filter-section.tsx`** (client, pilote l'URL via `useRouter`/`useSearchParams`/`usePathname`) : label `FILTRER` + pills (`TOUT` actif `bg-ink text-ivory`, inactifs bordés) qui poussent `?type=`, + résumé droite `NN PIÈCES · CIRE DE SOJA · 220G`, + trait de séparation.
- **`components/collection-grid.tsx`** : grille `grid-cols-2 medium:grid-cols-4` de `ProductCard`, état vide géré.
- **`templates/collection-list-template.tsx`** : compose `KultCollectionHero` + `FilterSection` + `CollectionGrid` + `KultCommentChoisir` + `KultNewsletter`.

## Page

`app/[countryCode]/(main)/collections/page.tsx` (server component) :
1. lit `searchParams.type` (défaut `all`) ;
2. fetch la catégorie `collection` → `listProducts({ category_id })` ;
3. `toPieceCard` sur chaque produit, puis `filterPiecesByType` **côté serveur** (RSC — pas de filtre client) ;
4. rend `CollectionListTemplate` avec pièces filtrées + `activeType` + count total.

## Tests

`src/modules/collections/lib/to-piece-card.test.ts` (si un runner est présent dans le storefront) :
- `toPieceCard` : mapping couleur/kind/motif/contenant/parfum, fallback format & parfum, calcul `textOnDark`.
- `filterPiecesByType` : `all`, `unis`, `motifs`, `edition`, type inconnu.

Pas de TDD lourd sur les composants visuels (proportionné).

## Hors périmètre (vs brief PNG initial)

Layout variable 1/4/3, produit highlight, config pattern BO, sidebar de filtres, badge NEW, facettes Couleur/Prix — absents de la maquette, non implémentés.
