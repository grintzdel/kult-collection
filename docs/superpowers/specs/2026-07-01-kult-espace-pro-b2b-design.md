# KULT — Espace Pro (B2B léger) — Design

**Date :** 2026-07-01
**Projet :** KULT (Medusa v2.17, monorepo `@dtc/backend` + storefront Next.js)
**Statut :** Design validé (amendé 2026-07-01 : toggle `online_purchase_enabled` mode contact/devis par défaut + menu admin « B2B ») — spec conservée, pas de plan d'implémentation demandé.

## Objectif

Ajouter un accès "pro" simple : des clients professionnels (revendeurs déco, boutiques,
hôtels/spas) achètent les bougies et parfums KULT à des **prix de gros HT**, avec un
**minimum de commande**. Le tout doit rester **majoritairement pilotable depuis l'admin
Medusa**, sans dupliquer le catalogue ni créer une seconde application.

## Décisions de cadrage (validées)

| Sujet | Décision |
|-------|----------|
| Modèle B2B | Accès pro **simple** — pas de devis, approbations, multi-acheteurs, Net 30. |
| Prix pro | **Prix de gros HT par produit** + **paliers de quantité**, via une Price List native. |
| Onboarding | **Comptes créés par l'admin.** Pas d'inscription auto. Une landing publique permet de *demander* un accès. |
| Emplacement storefront | **Même site enrichi une fois connecté** + **une landing `/pro` publique** (vitrine + formulaire). |
| Détection du mode pro | **Automatique** via l'appartenance au customer group "Pros" — jamais un toggle manuel. |
| Mode de vente pro | **Contact/devis par défaut** (le client préfère être contacté en direct). L'achat en ligne self-service est **désactivable via un toggle admin** (`online_purchase_enabled`). |
| Pilotage admin | Un **menu top-level « B2B »** dans l'admin (Config + Demandes d'accès), pas une sous-page Settings orpheline. |

## Architecture — vue d'ensemble

Pas d'application séparée, pas de toggle. **Mêmes routes storefront enrichies
conditionnellement** selon `isPro`, + **une seule route publique nouvelle** (`/pro`).

```
Prix pro         → serveur, automatique (price list du groupe Pros). Le front ne calcule rien.
isPro            → dérivé de customer.groups au login, exposé via un ProProvider (React context léger).
UI enrichie      → mêmes composants, conditionnés par isPro (badge Pro, prix HT, bandeau minimum).
Route nouvelle   → /[countryCode]/pro uniquement (vitrine + formulaire de demande d'accès).
Enforcement      → minimum de commande validé côté serveur au checkout.
```

Source de vérité unique : le **customer group "Pros"**, géré dans l'admin. Un client
bascule B2C ↔ B2B simplement en se connectant / déconnectant.

## 1. Briques natives Medusa (zéro custom, 100% admin)

- **Customer Group "Pros"** (`Customers → Groups`) : contient les comptes pro.
- **Price List "Tarif Pro"** liée au groupe : prix de gros HT par produit + paliers
  (`min_quantity` / `max_quantity`), dates de validité optionnelles. Édition produit par
  produit dans l'admin.
- **Création de compte pro** : l'admin crée le client et l'ajoute au groupe. Dès qu'il est
  connecté, le pricing engine résout automatiquement ses prix pro quand la requête produits
  est authentifiée avec son token client.

## 2. Custom léger — module `proSpace`

Ce que Medusa n'offre pas nativement : un **minimum de commande** paramétrable et un
**canal de demande d'accès**. On ajoute un module `proSpace` (nom camelCase, conforme aux
règles Medusa — pas de tiret).

**Modèles**

- **`ProConfig`** (singleton de configuration)
  - `active` (boolean) — l'espace pro existe / est visible **du tout** (landing + enrichissement storefront). Si `false`, KULT fonctionne en 100% B2C.
  - `online_purchase_enabled` (boolean) — **achat en ligne self-service** pour les pros. Deux modes :
    - `false` (**défaut**) — mode **« contact / devis »** : le pro connecté voit ses prix de gros HT et les paliers, mais le bouton *Ajouter au panier / Checkout* est remplacé par un CTA **« Demander un devis / Nous contacter »**. Aligné avec la préférence du client (être contacté en direct).
    - `true` — checkout pro self-service ouvert, avec enforcement du minimum de commande.
  - `min_order_amount` (number) — minimum de commande pour les pros (appliqué uniquement quand `online_purchase_enabled` est `true`)
  - `currency_code` (string)
  - `display_ht` (boolean) — afficher les prix HT côté pro

  > **Note** : `active` et `online_purchase_enabled` sont **deux flags distincts**. `active` pilote l'existence de l'espace pro ; `online_purchase_enabled` pilote seulement la capacité d'acheter en ligne (vs contact/devis). Ouvrir l'achat en ligne plus tard = basculer un booléen, sans refonte.
- **`ProLead`** (demande d'accès depuis la landing)
  - `company`, `vat_or_siret`, `email`, `message`, `status` (`pending` / `contacted` / `converted` / `rejected`)

**Flow Medusa respecté (Module → Workflow → API route → Front)**

- Workflows : `createProLeadWorkflow`, `updateProConfigWorkflow`.
- Routes store : `POST /store/pro/leads`, `GET /store/pro/config`.
- Routes admin : `GET|POST /admin/pro/config`, `GET /admin/pro/leads`.
- **Enforcement minimum de commande** : hook de validation dans `completeCartWorkflow` —
  **actif uniquement si `online_purchase_enabled` est `true`** ; si le client appartient au
  groupe Pros et que le total du panier < `min_order_amount`, le checkout est bloqué (le
  storefront affiche aussi un bandeau, mais la vérité est serveur). En mode contact/devis,
  il n'y a pas de checkout pro à enforcer.

**Admin UI (custom) — menu top-level « B2B »**

Un **item de navigation dédié « B2B »** (via `defineRouteConfig` avec `nav`), pas une sous-page
Settings orpheline. Il regroupe deux sections :

- **B2B › Configuration** : édition de `ProConfig` — toggles `active` et `online_purchase_enabled`,
  `min_order_amount`, `currency_code`, `display_ht`.
- **B2B › Demandes d'accès** : liste des `ProLead` (statuts `pending` / `contacted` / `converted`
  / `rejected`) + action **« Accorder l'accès pro »** (cf. Onboarding ci-dessous).

## 2bis. Onboarding « request → grant » (amendé 2026-07-01)

Le lead (la demande) et le compte client (l'accès réel qui déclenche `isPro`) sont deux objets
distincts — c'est voulu (le client vette avant d'accorder). Le défaut à corriger : ils ne se
parlaient pas, et « valider » un lead ne faisait rien de mécanique. On ajoute le **pont** :

**Flow :**
1. L'entreprise remplit `/pro` → crée un `ProLead` (`pending`).
2. L'entreprise crée elle-même un compte client (self-service, elle a donc un mot de passe).
   Pas d'email d'invitation en V1 (aucun provider email configuré ; reporté en V2).
3. Admin → **B2B › Demandes** → bouton **« Accorder l'accès pro »** sur un lead.
4. `grantProAccessWorkflow` : retrouve le **compte client par l'email du lead** →
   - **trouvé** : crée le groupe `Pros` s'il n'existe pas (auto-création), ajoute le client au
     groupe (idempotent — no-op s'il y est déjà), passe le lead en `converted`.
   - **non trouvé** : erreur claire « Aucun compte client pour cet email — le contact doit
     d'abord s'inscrire sur le site ». Le lead ne change pas de statut.

**Conséquences :**
- Le statut `converted` n'est plus décoratif : il est posé par l'action de grant.
- Le groupe `Pros` est auto-créé au premier grant → plus de création manuelle du groupe.
- `contacted` / `rejected` restent un suivi CRM libre (utile en mode contact-only).
- Reste manuel (natif Medusa) : la Price List « Tarif Pro » et ses prix.

**Backend ajouté :** `grantProAccessWorkflow` (+ step avec compensation : retire du groupe,
supprime le groupe s'il a été créé, restaure le statut) et route `POST /admin/pro/leads/:id/grant`.
Réutilise le service natif du module Customer (`listCustomers`, `listCustomerGroups`,
`createCustomerGroups`, `addCustomerToGroup`).

## 3. Storefront (Next.js)

- **`/[countryCode]/pro`** : landing wholesale publique (pitch, conditions, paliers,
  minimum de commande) + formulaire **"Demander un accès pro"** → `POST /store/pro/leads`.
- **`ProProvider`** (React context léger, ~30 lignes) : au login, récupère le client avec
  ses groupes, calcule `isPro`, l'expose à tout l'arbre.
- **Une fois connecté & dans le groupe Pros** :
  - prix pro affichés automatiquement (viennent du serveur), **en HT** + **badge "Pro"** ;
  - le comportement d'achat dépend de `config.online_purchase_enabled` (récupéré via `GET /store/pro/config`) :
    - **mode contact/devis (`false`, défaut)** : *Ajouter au panier / Checkout* remplacé par un CTA
      **« Demander un devis / Nous contacter »** (ré-utilise le formulaire de lead ou un mailto/contact) ;
      pas de bandeau minimum, pas de blocage checkout puisqu'il n'y a pas de checkout pro ;
    - **mode achat en ligne (`true`)** : panier/checkout self-service actifs, **bandeau minimum de commande**
      (ex : « Minimum 150 € HT — il manque 40 € »), checkout bloqué tant que le minimum n'est pas atteint
      (aligné sur l'enforcement serveur).
- Le reste du site (catalogue, fiche produit, panier, checkout, compte) est **réutilisé tel
  quel** — pas de duplication, seulement conditionné par `isPro`.

## Bonnes pratiques wholesale déco intégrées

- **Keystone pricing** : prix de gros ≈ 50 % du retail (le revendeur double sa marge).
- **Minimum de commande** (MOV) : quasi universel en wholesale ; ici paramétrable en admin.
- **Paliers de volume** : remise accrue sur gros volumes (natif via price list).
- **Prix HT** : le pro raisonne hors taxes.

## Hors scope V1 (YAGNI — ajoutable plus tard sans casser le socle)

- Devis / quotes.
- Approbations et comptes multi-acheteurs par société.
- Net 30 / facturation différée.
- Catalogue pro distinct (on garde le même catalogue, prix différents).
- Inscription pro auto-approuvée (les comptes restent créés par l'admin).
