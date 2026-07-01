# Hero 3D — bougie Kult (tilt souris + parallaxe scroll)

Date : 2026-06-30
Statut : design validé

## Objectif

Donner à la hero de la home un effet « 3D produit » à partir d'une **seule
image** détourée de bougie (pas de modèle 3D, pas de séquence d'images).
L'effet s'inspire de ciaoenergy.com (Three.js + GSAP + Lenis) mais en version
légère : profondeur simulée par perspective CSS + parallaxe multi-couches,
piloté par la souris et le scroll.

## Périmètre

- **Dans le périmètre** : la colonne droite (visuel) du composant `KultHero`.
- **Hors périmètre** : la colonne gauche (texte/CTA), les autres sections de la
  home, toute vraie 3D (WebGL/Three.js), toute librairie d'animation externe.

## Stack & contraintes

- Next.js 15 (App Router), React 19, Tailwind 3.
- **Aucune dépendance ajoutée** : transforms CSS + un hook React.
- Tokens design existants réutilisés : couleurs `ivory`/`terracotta`/`soleil`/
  `marine`/`ink`, classes `halo-soleil`, `motif-damier`, `badge`, `kult-container`.

## Composition — profondeur multi-couches

La scène est découpée en 3 plans qui réagissent avec des facteurs de parallaxe
différents (c'est la différence de vitesse entre plans qui crée le relief) :

| Plan      | Contenu                                   | Facteur parallaxe |
|-----------|-------------------------------------------|-------------------|
| Arrière   | `halo-soleil` (lueur diffuse)             | faible (~0.3)     |
| Milieu    | **Bougie KULT** (`next/image`)            | moyen (~1.0)      |
| Avant     | pastille `motif-damier` + badge texte     | fort (~1.4)       |

## Comportement

### Tilt souris (desktop, `hover: hover` uniquement)
- Écoute `pointermove` sur le conteneur hero.
- Position normalisée dans `[-1, 1]` sur X et Y.
- Applique `rotateY` (axe vertical) et `rotateX` (axe horizontal) à la scène,
  amplitude max **±12°**, sous un wrapper `perspective(900px)`.
- **Lissage (lerp)** : la valeur appliquée s'approche de la cible d'un facteur
  ~0.1 par frame → inertie douce.

### Parallaxe scroll (tous supports)
- Progression de sortie du hero `sp ∈ [0, 1]` calculée depuis le scroll.
- La scène : `translateY(-40px * sp)`, `scale(1 - 0.08 * sp)`, léger `rotateZ`.
- Chaque plan module ce déplacement par son facteur de parallaxe.

### Implémentation perf
- Un hook `useHero3D` attaché au conteneur via `ref`.
- Une **seule boucle `requestAnimationFrame`** qui lerp les cibles et écrit des
  **CSS custom properties** (`--rx`, `--ry`, `--sp`) directement sur le DOM.
- **Aucun `setState` par frame** → zéro re-render React pendant l'animation.
- Les `transform` sont déclarés en CSS/Tailwind arbitraire lisant ces variables.
- Listeners (`pointermove`, `scroll`) nettoyés au démontage.

## Accessibilité & responsive

- `prefers-reduced-motion: reduce` → tilt + parallaxe désactivés, bougie statique.
- Pas de pointeur fin (`matchMedia('(hover: hover)')` faux) → tilt désactivé ;
  on conserve la parallaxe scroll + un léger flottement.
- L'image porte un `alt` descriptif ; le badge reste lisible (contraste).

## Fichiers

1. `public/kult/candle-lavande.png` — image fournie, déplacée et renommée.
2. `src/modules/home/components/kult/candle-3d.tsx` — **nouveau** : composant
   client `KultCandle3D` + hook `useHero3D` (colocalisé).
3. `src/modules/home/components/kult/hero.tsx` — remplace les blocs colorés
   placeholder de la colonne droite par `<KultCandle3D />`.

## Critères de réussite

- La bougie s'incline en 3D en suivant la souris (desktop), avec inertie.
- En scrollant, la scène remonte/recule en parallaxe (les plans se décalent).
- Aucune lib ajoutée ; pas de re-render React pendant l'animation.
- Effet désactivé proprement en reduced-motion et sur tactile.
- Le reste de la home et la colonne texte sont inchangés.
