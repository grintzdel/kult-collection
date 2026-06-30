# Hero 3D — bougie Kult — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à la colonne droite du `KultHero` un effet « 3D produit » à partir d'une seule image de bougie : tilt souris + parallaxe scroll, en CSS + un hook React, sans dépendance ajoutée.

**Architecture:** Un conteneur en `perspective` ; une « scène » enfant en `transform-style: preserve-3d` dont la rotation/échelle est pilotée par des CSS custom properties (`--rx`, `--ry`, `--sp`). Trois plans de profondeur via `translateZ` (le `translateZ` + la perspective produisent la parallaxe gratuitement). Un hook `useHero3D` écoute `pointermove`/`scroll` et écrit les variables dans une boucle `requestAnimationFrame` avec lissage (lerp) — aucun re-render React par frame.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind 3, `next/image`. Aucune lib d'animation.

## Global Constraints

- Aucune dépendance npm ajoutée — transforms CSS + hook React uniquement.
- Aucun `setState` pendant l'animation (perf) — écriture directe de CSS vars via `ref`.
- `prefers-reduced-motion: reduce` → pas de tilt ni parallaxe (rendu statique).
- Tilt souris uniquement si `matchMedia('(hover: hover)')` ; parallaxe scroll partout.
- Amplitude tilt max ±12°. Réutiliser les classes existantes : `halo-soleil`, `motif-damier`, `badge`, `rounded-circle`.
- Ne PAS modifier la colonne texte du hero ni les autres sections de la home.
- Pas de test runner configuré dans `apps/storefront` : la vérification se fait par `pnpm lint` + lancement du dev server et observation visuelle.

---

### Task 1: Ajouter l'image produit dans `public/`

**Files:**
- Create: `apps/storefront/public/kult/candle-lavande.png` (copie de l'image fournie)

**Interfaces:**
- Produces: asset servi à l'URL `/kult/candle-lavande.png` (image carrée ~500×500, fond transparent).

- [ ] **Step 1: Copier l'image dans le storefront**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/workshop
mkdir -p medusa-store/apps/storefront/public/kult
cp "4b7690_f746b8c77ad14eecb12bb79dfe43537e_mv2-removebg-preview.png" \
   medusa-store/apps/storefront/public/kult/candle-lavande.png
```

- [ ] **Step 2: Vérifier que le fichier existe et a une taille plausible**

```bash
ls -l medusa-store/apps/storefront/public/kult/candle-lavande.png
```
Expected: fichier présent, taille ~60 KB (non vide).

- [ ] **Step 3: Commit**

```bash
cd medusa-store
git add apps/storefront/public/kult/candle-lavande.png
git commit -m "feat(home): add Kult lavande candle image asset"
```

---

### Task 2: Composant `KultCandle3D` + hook `useHero3D`

**Files:**
- Create: `apps/storefront/src/modules/home/components/kult/candle-3d.tsx`

**Interfaces:**
- Consumes: asset `/kult/candle-lavande.png` (Task 1).
- Produces: `export default KultCandle3D` — composant client sans props, à rendre dans la colonne droite du hero.

- [ ] **Step 1: Écrire le composant complet**

Créer `apps/storefront/src/modules/home/components/kult/candle-3d.tsx` avec exactement :

```tsx
"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

// Rotation/échelle de la scène, pilotées par les CSS custom properties.
// Valeurs par défaut (0) → rendu statique tant que le hook n'a rien écrit
// (et en prefers-reduced-motion, où le hook ne s'attache pas).
const STAGE_TRANSFORM =
  "rotateY(calc(var(--rx, 0) * 12deg)) " +
  "rotateX(calc(var(--ry, 0) * -12deg)) " +
  "translateY(calc(var(--sp, 0) * -40px)) " +
  "rotateZ(calc(var(--sp, 0) * -4deg)) " +
  "scale(calc(1 - var(--sp, 0) * 0.08))"

const useHero3D = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReduced) {
      return
    }

    const canHover = window.matchMedia("(hover: hover)").matches

    let targetRx = 0
    let targetRy = 0
    let targetSp = 0
    let curRx = 0
    let curRy = 0
    let curSp = 0
    let raf = 0

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      targetRx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      targetRy = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
    }

    const onPointerLeave = () => {
      targetRx = 0
      targetRy = 0
    }

    const computeScroll = () => {
      const rect = el.getBoundingClientRect()
      targetSp = clamp(-rect.top / window.innerHeight, 0, 1)
    }

    const tick = () => {
      curRx = lerp(curRx, targetRx, 0.1)
      curRy = lerp(curRy, targetRy, 0.1)
      curSp = lerp(curSp, targetSp, 0.12)
      el.style.setProperty("--rx", curRx.toFixed(4))
      el.style.setProperty("--ry", curRy.toFixed(4))
      el.style.setProperty("--sp", curSp.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    if (canHover) {
      el.addEventListener("pointermove", onPointerMove)
      el.addEventListener("pointerleave", onPointerLeave)
    }
    window.addEventListener("scroll", computeScroll, { passive: true })
    computeScroll()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("scroll", computeScroll)
    }
  }, [])

  return ref
}

const KultCandle3D = () => {
  const ref = useHero3D()

  return (
    <div ref={ref} className="relative h-[360px] small:h-[460px] [perspective:900px]">
      <div
        className="absolute inset-0 will-change-transform [transform-style:preserve-3d]"
        style={{ transform: STAGE_TRANSFORM }}
      >
        {/* Plan arrière — halo */}
        <div
          className="halo-soleil absolute left-1/2 top-1/2 h-[300px] w-[300px] rounded-circle small:h-[360px] small:w-[360px]"
          style={{ transform: "translate(-50%, -50%) translateZ(-60px)" }}
        />

        {/* Plan milieu — la bougie */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(0px)" }}
        >
          <Image
            src="/kult/candle-lavande.png"
            alt="Bougie KULT Lavande & Camomille"
            width={500}
            height={500}
            priority
            className="h-auto w-[220px] drop-shadow-2xl small:w-[280px]"
          />
        </div>

        {/* Plan avant — pastille motif + badge */}
        <div
          className="motif-damier absolute left-4 top-6 h-20 w-20 rounded-circle opacity-90 small:h-24 small:w-24"
          style={{ transform: "translateZ(80px)" }}
        />
        <span
          className="badge absolute bottom-2 left-1/2 whitespace-nowrap"
          style={{ transform: "translate(-50%, 0) translateZ(80px)" }}
        >
          Lavande &amp; Camomille
        </span>
      </div>
    </div>
  )
}

export default KultCandle3D
```

- [ ] **Step 2: Vérifier le typage et le lint du fichier**

```bash
cd medusa-store/apps/storefront
pnpm lint
```
Expected: aucune erreur sur `candle-3d.tsx` (warnings préexistants du starter tolérés).

- [ ] **Step 3: Commit**

```bash
cd medusa-store
git add apps/storefront/src/modules/home/components/kult/candle-3d.tsx
git commit -m "feat(home): add KultCandle3D component with mouse-tilt + scroll parallax"
```

---

### Task 3: Brancher `KultCandle3D` dans le hero

**Files:**
- Modify: `apps/storefront/src/modules/home/components/kult/hero.tsx`

**Interfaces:**
- Consumes: `export default KultCandle3D` (Task 2).

- [ ] **Step 1: Importer le composant**

Ajouter en haut de `hero.tsx` (avant la déclaration de `KultHero`) :

```tsx
import KultCandle3D from "./candle-3d"
```

- [ ] **Step 2: Remplacer le visuel placeholder de la colonne droite**

Remplacer **tout** le bloc actuel de la colonne droite, c'est-à-dire ce JSX :

```tsx
        <div className="relative h-[360px] small:h-[460px]">
          <div className="animate-kult-float absolute inset-0 flex items-end justify-center gap-5">
            <div className="absolute left-6 top-2 h-24 w-24 overflow-hidden rounded-circle motif-damier opacity-90 small:h-28 small:w-28" />

            <div className="relative h-[300px] w-[200px] overflow-hidden rounded-t-full bg-terracotta shadow-soft small:h-[380px] small:w-[240px]">
              <div className="halo-soleil animate-kult-halo absolute inset-0" />
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-label text-ivory/80">
                [ Bougies en situ ]
              </span>
            </div>

            <div className="h-[200px] w-[130px] rounded-t-full bg-marine shadow-soft small:h-[250px] small:w-[150px]" />
          </div>
        </div>
```

par :

```tsx
        <KultCandle3D />
```

- [ ] **Step 3: Lint + build de contrôle**

```bash
cd medusa-store/apps/storefront
pnpm lint
```
Expected: pas d'erreur (import résolu, JSX valide).

- [ ] **Step 4: Commit**

```bash
cd medusa-store
git add apps/storefront/src/modules/home/components/kult/hero.tsx
git commit -m "feat(home): wire KultCandle3D into hero right column"
```

---

### Task 4: Vérification visuelle dans le navigateur

**Files:** aucun (vérification manuelle).

- [ ] **Step 1: Lancer le storefront**

```bash
cd medusa-store
pnpm storefront:dev
```
Ouvrir `http://localhost:8000` sur la home.

- [ ] **Step 2: Vérifier chaque comportement**

- [ ] La bougie s'affiche nette (pas de fond blanc parasite) à droite du titre.
- [ ] **Tilt souris** : déplacer la souris sur la zone droite → la scène s'incline en 3D (max ~±12°) et revient au centre quand la souris quitte la zone, avec inertie.
- [ ] **Parallaxe scroll** : scroller vers le bas → la bougie remonte, recule légèrement (scale) et pivote un peu ; les plans (halo / badge) se décalent à des profondeurs différentes.
- [ ] **Reduced motion** : activer « réduire les animations » dans l'OS → la bougie reste statique et centrée, aucun mouvement.
- [ ] **Tactile** : en mode responsive/touch (DevTools, device sans `hover`) → pas de tilt souris, la parallaxe scroll reste active, pas de comportement cassé.
- [ ] La colonne texte gauche et les autres sections sont inchangées.

- [ ] **Step 3: (si ajustement nécessaire)**

Si l'amplitude paraît trop forte/faible, ajuster les constantes dans `STAGE_TRANSFORM` (`12deg`) et/ou les `translateZ` des plans, puis recommit. Sinon, terminé.

---

## Self-Review

**Spec coverage :**
- Image unique → Task 1 (asset) + Task 2 (`next/image`). ✓
- 3 plans de profondeur (halo / bougie / badge+pastille) → Task 2 (translateZ −60/0/+80). ✓
- Tilt souris ±12° + lerp → Task 2 (`STAGE_TRANSFORM`, `lerp 0.1`). ✓
- Parallaxe scroll (translateY/scale/rotateZ) → Task 2 (`--sp`). ✓
- CSS vars via rAF, pas de re-render → Task 2 (`el.style.setProperty` dans `tick`). ✓
- reduced-motion + `hover: hover` → Task 2 (early return + garde `canHover`). ✓
- Wiring dans hero, texte inchangé → Task 3. ✓
- Vérification → Task 4. ✓

**Placeholder scan :** aucun TODO/TBD ; tout le code est complet. ✓

**Type consistency :** `useHero3D` retourne `RefObject<HTMLDivElement>` consommé par `ref` du conteneur ; `KultCandle3D` export default sans props, importé tel quel en Task 3. ✓
