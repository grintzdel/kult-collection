# Sections éditoriales produit — éditables par produit

**Date :** 2026-07-01
**Statut :** validé

## Problème

Sur les pages produit du storefront, les sections en accordéon (« Détails & matière »,
« Rituel d'allumage », « Livraison & retours ») sont **codées en dur** dans
`product-accordions.tsx`. Elles sont donc identiques pour tous les produits et non
modifiables depuis l'admin. De plus, « Rituel d'allumage » doit être renommé en
« Utilisation ».

## Objectif

- Rendre ces 3 sections **spécifiques à chaque produit**.
- Les rendre **éditables depuis le panel admin**, produit par produit.
- Renommer « Rituel d'allumage » → « Utilisation ».
- Ne plus avoir aucun de ces textes en dur dans le templating.

## Décisions

- **Stockage :** `product.metadata` (pas de module custom, pas de migration).
  Le storefront fetch déjà `+metadata` (`apps/storefront/src/lib/data/products.ts:73`).
- **Fallback :** une section dont la valeur metadata est vide est **masquée**
  (aucun texte générique de repli).
- **Admin :** un widget sur la page produit (pas de route backend custom — l'endpoint
  natif `product update` suffit).

### Clés metadata

| Clé metadata        | Titre affiché         |
|---------------------|-----------------------|
| `details_matiere`   | Détails & matière     |
| `utilisation`       | Utilisation           |
| `livraison_retours` | Livraison & retours   |

## Changements

### Storefront

1. **`apps/storefront/src/modules/home/components/kult/pieces.ts`**
   - Ajouter au type `Piece` : `sections: { title: string; body: string }[]`.
   - Dans `toPiece()`, construire `sections` à partir de `product.metadata` selon la
     table de clés ci-dessus ; n'inclure que les entrées dont la valeur (trim) est
     non-vide, dans l'ordre : détails → utilisation → livraison.
   - Retirer toute génération en dur liée à ces 3 sections.

2. **`apps/storefront/src/modules/home/components/kult/product-accordions.tsx`**
   - Supprimer la constante `ITEMS` codée en dur.
   - Recevoir `sections: { title: string; body: string }[]` en props.
   - Si `sections` est vide → ne rien rendre (`return null`).
   - Rendre le corps avec `whitespace-pre-line` pour respecter les sauts de ligne saisis.

3. **`apps/storefront/src/modules/home/components/kult/product-template.tsx`**
   - Passer `piece.sections` au composant `KultProductAccordions`.

### Admin

4. **`apps/backend/src/admin/widgets/product-editorial.tsx`** (nouveau)
   - `zone: "product.details.after"`.
   - Affiche les valeurs actuelles lues depuis `data.metadata` (ou un état vide propre).
   - Bouton « Modifier » → **Drawer** (édition d'entité existante) avec 3 `Textarea`
     labellisés FR : Détails & matière, Utilisation, Livraison & retours.
   - Sauvegarde :
     `sdk.admin.product.update(id, { metadata: { ...data.metadata, details_matiere, utilisation, livraison_retours } })`
     (merge pour préserver les autres clés metadata).
   - `queryClient.invalidateQueries` sur la query produit + `toast` succès/erreur.
   - `disabled` / `isLoading` pendant la mutation. Composants Medusa UI, `size="small"`,
     couleurs sémantiques.

## Hors périmètre (YAGNI)

- Pas de module custom ni de data model.
- Pas de migration DB.
- Pas de route backend custom.
- Pas de rich-text (textarea simple, `whitespace-pre-line` au rendu).

## Vérification

- Storefront : un produit sans metadata n'affiche aucun accordéon ; un produit avec
  1 à 3 clés affiche exactement les sections remplies, avec le nouveau titre
  « Utilisation ».
- Admin : éditer les 3 champs depuis la page produit, sauvegarder, recharger →
  valeurs persistées ; les autres clés metadata ne sont pas écrasées.
- `lint` passe sur les deux apps.

## Git

- Branche : `feat/product-editorial-sections` (depuis `origin/main`).
- Commits (conventional commits) :
  - `feat(storefront): sections produit dynamiques via metadata`
  - `feat(admin): widget d'édition des sections produit`
- Push + PR.
