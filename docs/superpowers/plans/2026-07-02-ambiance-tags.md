# Ambiances produit — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre d'attribuer une « ambiance » (california, palm beach, cozy, méditerranée) à une catégorie ou un produit, en réutilisant les tags produit natifs de Medusa, avec surcharge produit sur l'héritage catégorie — backend + admin uniquement.

**Architecture:** On réutilise `product_tag` (aucun modèle custom). L'ambiance d'une catégorie vit dans `product_category.metadata.ambiance_tag_id` ; celle d'un produit dans sa relation native `product.tags` (surcharge). Une fonction pure résout l'ambiance effective (surcharge → héritage). Toutes les mutations passent par des workflows ; l'admin appelle des routes API custom via le SDK.

**Tech Stack:** Medusa v2 (framework/utils, core-flows, workflows-sdk), Zod, React + `@medusajs/ui` + `@tanstack/react-query` (admin), Jest (tests unitaires).

## Global Constraints

- **Réutiliser les tags natifs** (`product_tag`), aucun nouveau modèle, aucune migration.
- **Aucun module link** catégorie↔tag (collision même-module) : catégorie via `metadata.ambiance_tag_id`.
- **Toute mutation via un workflow** (règle Medusa) ; jamais d'appel service direct depuis une route.
- **Méthodes HTTP** : GET / POST / DELETE uniquement (jamais PUT/PATCH).
- **Routes admin protégées** : `AuthenticatedMedusaRequest`, validation Zod via middlewares.
- **SDK admin** : toujours `sdk.client.fetch(...)`, jamais `fetch` nu.
- **Clé metadata catégorie** : littéral `"ambiance_tag_id"`.
- **Valeurs d'ambiance seed** (exactes) : `california`, `palm beach`, `cozy`, `méditerranée`.
- **Style de code** : suivre le style des fichiers voisins. Fichiers `src/api`, `src/admin`, `src/workflows`, `src/lib` → guillemets doubles, **pas** de point-virgule (comme `product-attribute`). Fichier `src/migration-scripts/initial-data-seed.ts` → guillemets doubles **avec** point-virgule (comme l'existant).
- **Scope** : pas de storefront (aucune route `/store`, aucun rendu boutique).
- **Backend dir** : toutes les commandes se lancent depuis `apps/backend`.

## File Structure

- `src/lib/ambiance/resolve-ambiance.ts` — fonction pure de résolution (surcharge → héritage).
- `src/lib/ambiance/query-ambiance.ts` — hydrate les données produit + catégorie et appelle la résolution.
- `src/lib/ambiance/__tests__/*.unit.spec.ts` — tests unitaires (Jest).
- `src/workflows/ambiance/set-category-ambiance.ts` — écrit `metadata.ambiance_tag_id`.
- `src/workflows/ambiance/set-product-ambiance.ts` — écrit `product.tags` (surcharge).
- `src/api/admin/ambiances/middlewares.ts` — schémas Zod + matchers.
- `src/api/admin/ambiances/route.ts` — GET liste + POST create.
- `src/api/admin/ambiances/[id]/route.ts` — POST update + DELETE.
- `src/api/admin/products/[id]/ambiance/route.ts` — GET résolu + POST surcharge.
- `src/api/admin/product-categories/[id]/ambiance/route.ts` — POST assignation catégorie.
- `src/api/middlewares.ts` — enregistrer `ambianceAdminMiddlewares` (modif).
- `src/admin/components/ambiances/types.ts` — types partagés admin.
- `src/admin/routes/ambiances/page.tsx` — page sidebar « Ambiances ».
- `src/admin/widgets/product-ambiance.tsx` — widget fiche produit.
- `src/migration-scripts/initial-data-seed.ts` — seed des ambiances (modif).

---

### Task 1: Fonction pure de résolution `resolveProductAmbiance`

**Files:**
- Create: `apps/backend/src/lib/ambiance/resolve-ambiance.ts`
- Test: `apps/backend/src/lib/ambiance/__tests__/resolve-ambiance.unit.spec.ts`

**Interfaces:**
- Produces: `type AmbianceTag = { id: string; value: string }` ; `resolveProductAmbiance(productTags: AmbianceTag[] | null | undefined, categoryAmbiance: AmbianceTag | null | undefined): AmbianceTag | null`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/lib/ambiance/__tests__/resolve-ambiance.unit.spec.ts`:

```typescript
import { AmbianceTag, resolveProductAmbiance } from "../resolve-ambiance"

const tag = (id: string, value: string): AmbianceTag => ({ id, value })

describe("resolveProductAmbiance", () => {
  it("returns the product's own tag (override) when present", () => {
    expect(
      resolveProductAmbiance([tag("t1", "cozy")], tag("t2", "california"))
    ).toEqual({ id: "t1", value: "cozy" })
  })

  it("falls back to the category ambiance when the product has no tag", () => {
    expect(resolveProductAmbiance([], tag("t2", "california"))).toEqual({
      id: "t2",
      value: "california",
    })
  })

  it("falls back to the category ambiance when tags is null", () => {
    expect(resolveProductAmbiance(null, tag("t2", "california"))).toEqual({
      id: "t2",
      value: "california",
    })
  })

  it("returns null when there is neither an override nor a category ambiance", () => {
    expect(resolveProductAmbiance(null, null)).toBeNull()
    expect(resolveProductAmbiance([], undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run (depuis `apps/backend`):
```bash
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest resolve-ambiance --runInBand --forceExit
```
Expected: FAIL — `Cannot find module '../resolve-ambiance'`.

- [ ] **Step 3: Write the implementation**

Create `apps/backend/src/lib/ambiance/resolve-ambiance.ts`:

```typescript
export type AmbianceTag = { id: string; value: string }

/**
 * Ambiance effective d'un produit : sa surcharge (1er tag natif) gagne ; sinon
 * l'ambiance héritée de sa catégorie ; sinon null.
 *
 * @param productTags tags natifs du produit (`product.tags`)
 * @param categoryAmbiance ambiance de la catégorie, déjà hydratée (id + value)
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

- [ ] **Step 4: Run the test to verify it passes**

Run (depuis `apps/backend`):
```bash
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest resolve-ambiance --runInBand --forceExit
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/lib/ambiance/resolve-ambiance.ts apps/backend/src/lib/ambiance/__tests__/resolve-ambiance.unit.spec.ts
git commit -m "feat(backend): fonction pure de résolution d'ambiance produit

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Helper de requête `fetchProductAmbiance`

**Files:**
- Create: `apps/backend/src/lib/ambiance/query-ambiance.ts`
- Test: `apps/backend/src/lib/ambiance/__tests__/query-ambiance.unit.spec.ts`

**Interfaces:**
- Consumes: `resolveProductAmbiance`, `AmbianceTag` (Task 1).
- Produces: `const CATEGORY_AMBIANCE_METADATA_KEY = "ambiance_tag_id"` ; `fetchProductAmbiance(query: QueryLike, productId: string): Promise<AmbianceTag | null>` où `QueryLike = { graph(config): Promise<{ data: unknown[] }> }`.

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/lib/ambiance/__tests__/query-ambiance.unit.spec.ts`:

```typescript
import { fetchProductAmbiance } from "../query-ambiance"

const makeQuery = (responses: Record<string, unknown[]>) => ({
  graph: async ({ entity }: { entity: string }) => ({
    data: responses[entity] ?? [],
  }),
})

describe("fetchProductAmbiance", () => {
  it("returns the product override when the product has a tag", async () => {
    const query = makeQuery({
      product: [
        {
          id: "p1",
          tags: [{ id: "t1", value: "cozy" }],
          categories: [{ metadata: { ambiance_tag_id: "t2" } }],
        },
      ],
      product_tag: [{ id: "t2", value: "california" }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t1",
      value: "cozy",
    })
  })

  it("hydrates the inherited category ambiance when the product has no tag", async () => {
    const query = makeQuery({
      product: [
        {
          id: "p1",
          tags: [],
          categories: [{ metadata: { ambiance_tag_id: "t2" } }],
        },
      ],
      product_tag: [{ id: "t2", value: "california" }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toEqual({
      id: "t2",
      value: "california",
    })
  })

  it("returns null when neither product nor category defines an ambiance", async () => {
    const query = makeQuery({
      product: [{ id: "p1", tags: [], categories: [{ metadata: {} }] }],
    })
    expect(await fetchProductAmbiance(query, "p1")).toBeNull()
  })

  it("returns null when the product does not exist", async () => {
    const query = makeQuery({ product: [] })
    expect(await fetchProductAmbiance(query, "nope")).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run (depuis `apps/backend`):
```bash
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest query-ambiance --runInBand --forceExit
```
Expected: FAIL — `Cannot find module '../query-ambiance'`.

- [ ] **Step 3: Write the implementation**

Create `apps/backend/src/lib/ambiance/query-ambiance.ts`:

```typescript
import { AmbianceTag, resolveProductAmbiance } from "./resolve-ambiance"

export const CATEGORY_AMBIANCE_METADATA_KEY = "ambiance_tag_id"

type QueryLike = {
  graph: (config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: unknown[] }>
}

/**
 * Résout l'ambiance effective d'un produit : sa surcharge (`product.tags`), sinon
 * l'ambiance héritée de la 1re catégorie qui en définit une
 * (`product_category.metadata.ambiance_tag_id`), hydratée en (id + value).
 */
export const fetchProductAmbiance = async (
  query: QueryLike,
  productId: string
): Promise<AmbianceTag | null> => {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "tags.id", "tags.value", "categories.metadata"],
    filters: { id: productId },
  })

  const product = data[0] as
    | {
        tags?: { id: string; value: string }[]
        categories?: { metadata?: Record<string, unknown> | null }[]
      }
    | undefined

  if (!product) {
    return null
  }

  const productTags: AmbianceTag[] = (product.tags ?? []).map((t) => ({
    id: t.id,
    value: t.value,
  }))

  const inheritedId = (product.categories ?? [])
    .map((c) => c.metadata?.[CATEGORY_AMBIANCE_METADATA_KEY])
    .find((v): v is string => typeof v === "string" && v.length > 0)

  let categoryAmbiance: AmbianceTag | null = null
  if (inheritedId) {
    const { data: tagData } = await query.graph({
      entity: "product_tag",
      fields: ["id", "value"],
      filters: { id: inheritedId },
    })
    const tag = tagData[0] as { id: string; value: string } | undefined
    categoryAmbiance = tag ? { id: tag.id, value: tag.value } : null
  }

  return resolveProductAmbiance(productTags, categoryAmbiance)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run (depuis `apps/backend`):
```bash
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest query-ambiance --runInBand --forceExit
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/lib/ambiance/query-ambiance.ts apps/backend/src/lib/ambiance/__tests__/query-ambiance.unit.spec.ts
git commit -m "feat(backend): helper de requête d'ambiance produit (hydratation + résolution)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Workflows d'assignation

**Files:**
- Create: `apps/backend/src/workflows/ambiance/set-category-ambiance.ts`
- Create: `apps/backend/src/workflows/ambiance/set-product-ambiance.ts`

**Interfaces:**
- Produces: `setCategoryAmbianceWorkflow` (input `{ category_id: string; tag_id: string | null }`) ; `setProductAmbianceWorkflow` (input `{ product_id: string; tag_id: string | null }`).

- [ ] **Step 1: Write `set-category-ambiance.ts`**

Create `apps/backend/src/workflows/ambiance/set-category-ambiance.ts`:

```typescript
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

type Input = {
  category_id: string
  tag_id: string | null
}

/**
 * Écrit l'ambiance d'une catégorie dans sa metadata (`ambiance_tag_id`).
 * Note : la catégorie ne porte pas d'autre metadata dans cette boutique ; on écrit
 * donc l'objet directement (le workflow natif remplace la metadata).
 */
export const setCategoryAmbianceWorkflow = createWorkflow(
  "set-category-ambiance",
  function (input: Input) {
    const updateInput = transform({ input }, ({ input }) => ({
      selector: { id: input.category_id },
      update: {
        metadata: { ambiance_tag_id: input.tag_id },
      },
    }))

    const result = updateProductCategoriesWorkflow.runAsStep({ input: updateInput })

    return new WorkflowResponse(result)
  }
)

export default setCategoryAmbianceWorkflow
```

- [ ] **Step 2: Write `set-product-ambiance.ts`**

Create `apps/backend/src/workflows/ambiance/set-product-ambiance.ts`:

```typescript
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type Input = {
  product_id: string
  tag_id: string | null
}

/**
 * Écrit la surcharge d'ambiance d'un produit via ses tags natifs.
 * `tag_id` null → aucun tag (le produit hérite de sa catégorie).
 */
export const setProductAmbianceWorkflow = createWorkflow(
  "set-product-ambiance",
  function (input: Input) {
    const updateInput = transform({ input }, ({ input }) => ({
      selector: { id: input.product_id },
      update: {
        tag_ids: input.tag_id ? [input.tag_id] : [],
      },
    }))

    const result = updateProductsWorkflow.runAsStep({ input: updateInput })

    return new WorkflowResponse(result)
  }
)

export default setProductAmbianceWorkflow
```

> Si le build signale un type sur `tag_ids`, remplacer la ligne par :
> `tags: input.tag_id ? [{ id: input.tag_id }] : [],`

- [ ] **Step 3: Run the build to validate**

Run (depuis `apps/backend`):
```bash
npm run build
```
Expected: build réussi, aucune erreur de type.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/workflows/ambiance
git commit -m "feat(backend): workflows d'assignation d'ambiance (catégorie + produit)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Routes API admin + enregistrement des middlewares

**Files:**
- Create: `apps/backend/src/api/admin/ambiances/middlewares.ts`
- Create: `apps/backend/src/api/admin/ambiances/route.ts`
- Create: `apps/backend/src/api/admin/ambiances/[id]/route.ts`
- Create: `apps/backend/src/api/admin/products/[id]/ambiance/route.ts`
- Create: `apps/backend/src/api/admin/product-categories/[id]/ambiance/route.ts`
- Modify: `apps/backend/src/api/middlewares.ts`

**Interfaces:**
- Consumes: `setCategoryAmbianceWorkflow`, `setProductAmbianceWorkflow` (Task 3) ; `fetchProductAmbiance` (Task 2).
- Produces: routes REST ; `CreateAmbianceSchema`, `UpdateAmbianceSchema`, `SetAmbianceSchema`, `ambianceAdminMiddlewares`.

- [ ] **Step 1: Write the middlewares/schemas file**

Create `apps/backend/src/api/admin/ambiances/middlewares.ts`:

```typescript
import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const CreateAmbianceSchema = z.object({
  value: z.string().min(1),
})
export type CreateAmbianceSchema = z.infer<typeof CreateAmbianceSchema>

export const UpdateAmbianceSchema = z.object({
  value: z.string().min(1),
})
export type UpdateAmbianceSchema = z.infer<typeof UpdateAmbianceSchema>

export const SetAmbianceSchema = z.object({
  tag_id: z.string().min(1).nullable(),
})
export type SetAmbianceSchema = z.infer<typeof SetAmbianceSchema>

export const ambianceAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/ambiances",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateAmbianceSchema)],
  },
  {
    matcher: "/admin/ambiances/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateAmbianceSchema)],
  },
  {
    matcher: "/admin/products/:id/ambiance",
    method: "POST",
    middlewares: [validateAndTransformBody(SetAmbianceSchema)],
  },
  {
    matcher: "/admin/product-categories/:id/ambiance",
    method: "POST",
    middlewares: [validateAndTransformBody(SetAmbianceSchema)],
  },
]
```

- [ ] **Step 2: Write the collection route (list + create)**

Create `apps/backend/src/api/admin/ambiances/route.ts`:

```typescript
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductTagsWorkflow } from "@medusajs/medusa/core-flows"
import { CreateAmbianceSchema } from "./middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: tags } = await query.graph({
    entity: "product_tag",
    fields: ["id", "value", "products.id"],
  })

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "metadata"],
  })

  const categoryCountByTag = new Map<string, number>()
  for (const c of categories as { metadata?: Record<string, unknown> | null }[]) {
    const tagId = c.metadata?.ambiance_tag_id
    if (typeof tagId === "string") {
      categoryCountByTag.set(tagId, (categoryCountByTag.get(tagId) ?? 0) + 1)
    }
  }

  const ambiances = (
    tags as { id: string; value: string; products?: unknown[] }[]
  ).map((t) => ({
    id: t.id,
    value: t.value,
    product_count: t.products?.length ?? 0,
    category_count: categoryCountByTag.get(t.id) ?? 0,
  }))

  return res.json({ ambiances })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateAmbianceSchema>,
  res: MedusaResponse
) {
  const { result } = await createProductTagsWorkflow(req.scope).run({
    input: { product_tags: [{ value: req.validatedBody.value }] },
  })

  return res.status(201).json({ ambiance: result[0] })
}
```

- [ ] **Step 3: Write the item route (update + delete)**

Create `apps/backend/src/api/admin/ambiances/[id]/route.ts`:

```typescript
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteProductTagsWorkflow,
  updateProductTagsWorkflow,
} from "@medusajs/medusa/core-flows"
import { UpdateAmbianceSchema } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateAmbianceSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { result } = await updateProductTagsWorkflow(req.scope).run({
    input: {
      selector: { id },
      update: { value: req.validatedBody.value },
    },
  })

  return res.json({ ambiance: result[0] })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  await deleteProductTagsWorkflow(req.scope).run({ input: { ids: [id] } })

  return res.json({ id, object: "ambiance", deleted: true })
}
```

- [ ] **Step 4: Write the product ambiance route (resolve + override)**

Create `apps/backend/src/api/admin/products/[id]/ambiance/route.ts`:

```typescript
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { fetchProductAmbiance } from "../../../../../lib/ambiance/query-ambiance"
import { setProductAmbianceWorkflow } from "../../../../../workflows/ambiance/set-product-ambiance"
import { SetAmbianceSchema } from "../../../ambiances/middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const ambiance = await fetchProductAmbiance(query, req.params.id)
  return res.json({ ambiance })
}

export async function POST(
  req: AuthenticatedMedusaRequest<SetAmbianceSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  await setProductAmbianceWorkflow(req.scope).run({
    input: { product_id: id, tag_id: req.validatedBody.tag_id },
  })

  return res.json({ product_id: id, tag_id: req.validatedBody.tag_id })
}
```

- [ ] **Step 5: Write the category ambiance route (assign)**

Create `apps/backend/src/api/admin/product-categories/[id]/ambiance/route.ts`:

```typescript
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { setCategoryAmbianceWorkflow } from "../../../../../workflows/ambiance/set-category-ambiance"
import { SetAmbianceSchema } from "../../../ambiances/middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<SetAmbianceSchema>,
  res: MedusaResponse
) {
  const { id } = req.params
  await setCategoryAmbianceWorkflow(req.scope).run({
    input: { category_id: id, tag_id: req.validatedBody.tag_id },
  })

  return res.json({ category_id: id, tag_id: req.validatedBody.tag_id })
}
```

- [ ] **Step 6: Register the middlewares**

Modify `apps/backend/src/api/middlewares.ts` — add the import and spread `ambianceAdminMiddlewares` into `routes`:

```typescript
import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import { storeProLeadMiddlewares } from "./store/pro/leads/middlewares"
import { adminProMiddlewares } from "./admin/pro/middlewares"
import { productAttributeAdminMiddlewares } from "./admin/product-attributes/middlewares"
import { ambianceAdminMiddlewares } from "./admin/ambiances/middlewares"

export default defineMiddlewares({
  routes: [
    ...storeProLeadMiddlewares,
    ...adminProMiddlewares,
    ...productAttributeAdminMiddlewares,
    ...ambianceAdminMiddlewares,
    {
      matcher: "/store/pro/me",
      method: "GET",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
```

- [ ] **Step 7: Run the build to validate**

Run (depuis `apps/backend`):
```bash
npm run build
```
Expected: build réussi.

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/api
git commit -m "feat(backend): routes admin ambiances (CRUD tags + assignation catégorie/produit)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Types partagés admin + page sidebar « Ambiances »

**Files:**
- Create: `apps/backend/src/admin/components/ambiances/types.ts`
- Create: `apps/backend/src/admin/routes/ambiances/page.tsx`

**Interfaces:**
- Consumes: routes `/admin/ambiances`, `/admin/product-categories/:id/ambiance` (Task 4).
- Produces: `type Ambiance`, `type AmbianceCategory`, `AMBIANCES_QUERY_KEY`, item de menu « Ambiances ».

- [ ] **Step 1: Write the shared types**

Create `apps/backend/src/admin/components/ambiances/types.ts`:

```typescript
export const AMBIANCES_QUERY_KEY = ["ambiances"] as const

export type Ambiance = {
  id: string
  value: string
  product_count: number
  category_count: number
}

export type AmbianceCategory = {
  id: string
  name: string
  metadata?: Record<string, unknown> | null
}
```

- [ ] **Step 2: Write the sidebar page**

Create `apps/backend/src/admin/routes/ambiances/page.tsx`:

```tsx
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Swatch } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  Ambiance,
  AMBIANCES_QUERY_KEY,
  AmbianceCategory,
} from "../../components/ambiances/types"
import { sdk } from "../../lib/client"

const CATEGORIES_KEY = ["ambiance-categories"]
const NONE = "__none__"

const AmbiancesPage = () => {
  const queryClient = useQueryClient()
  const [newValue, setNewValue] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  const { data: ambiancesData, isLoading } = useQuery<{ ambiances: Ambiance[] }>({
    queryKey: AMBIANCES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/ambiances"),
  })

  const { data: categoriesData } = useQuery<{
    product_categories: AmbianceCategory[]
  }>({
    queryKey: CATEGORIES_KEY,
    queryFn: () =>
      sdk.client.fetch("/admin/product-categories", {
        query: { limit: 100, fields: "id,name,metadata" },
      }),
  })

  const ambiances = ambiancesData?.ambiances ?? []
  const categories = categoriesData?.product_categories ?? []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: AMBIANCES_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
  }

  const createAmbiance = useMutation({
    mutationFn: (value: string) =>
      sdk.client.fetch("/admin/ambiances", { method: "POST", body: { value } }),
    onSuccess: () => {
      invalidate()
      setNewValue("")
      toast.success("Ambiance créée")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la création"),
  })

  const updateAmbiance = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      sdk.client.fetch(`/admin/ambiances/${id}`, {
        method: "POST",
        body: { value },
      }),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
      toast.success("Ambiance mise à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la mise à jour"),
  })

  const deleteAmbiance = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/ambiances/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate()
      toast.success("Ambiance supprimée")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la suppression"),
  })

  const assignCategory = useMutation({
    mutationFn: ({
      categoryId,
      tagId,
    }: {
      categoryId: string
      tagId: string | null
    }) =>
      sdk.client.fetch(`/admin/product-categories/${categoryId}/ambiance`, {
        method: "POST",
        body: { tag_id: tagId },
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Ambiance de la catégorie mise à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'assignation"),
  })

  const categoryAmbianceId = (c: AmbianceCategory): string => {
    const raw = c.metadata?.ambiance_tag_id
    return typeof raw === "string" ? raw : NONE
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Ambiances</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Étiquettes d'ambiance (tags produit) attribuées aux catégories,
              surchargeables par produit.
            </Text>
          </div>
        </div>

        <div className="flex items-end gap-x-2 px-6 py-4">
          <div className="flex flex-1 flex-col gap-y-2">
            <Label size="small" weight="plus">
              Nouvelle ambiance
            </Label>
            <Input
              placeholder="ex. california"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </div>
          <Button
            size="small"
            variant="secondary"
            disabled={!newValue.trim() || createAmbiance.isPending}
            isLoading={createAmbiance.isPending}
            onClick={() => createAmbiance.mutate(newValue.trim())}
          >
            Ajouter
          </Button>
        </div>

        {isLoading ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Chargement…
            </Text>
          </div>
        ) : ambiances.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Aucune ambiance. Créez-en une ci-dessus.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Ambiance</Table.HeaderCell>
                <Table.HeaderCell>Catégories</Table.HeaderCell>
                <Table.HeaderCell>Produits surchargés</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ambiances.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell>
                    {editingId === a.id ? (
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <Text size="small" weight="plus">
                        {a.value}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>{a.category_count}</Table.Cell>
                  <Table.Cell>{a.product_count}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-x-2">
                      {editingId === a.id ? (
                        <>
                          <Button
                            size="small"
                            variant="transparent"
                            isLoading={updateAmbiance.isPending}
                            disabled={!editingValue.trim()}
                            onClick={() =>
                              updateAmbiance.mutate({
                                id: a.id,
                                value: editingValue.trim(),
                              })
                            }
                          >
                            Enregistrer
                          </Button>
                          <Button
                            size="small"
                            variant="transparent"
                            onClick={() => setEditingId(null)}
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="transparent"
                            onClick={() => {
                              setEditingId(a.id)
                              setEditingValue(a.value)
                            }}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="small"
                            variant="transparent"
                            className="text-ui-fg-error"
                            isLoading={
                              deleteAmbiance.isPending &&
                              deleteAmbiance.variables === a.id
                            }
                            onClick={() => deleteAmbiance.mutate(a.id)}
                          >
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Ambiance par catégorie</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Chaque catégorie transmet son ambiance à ses produits (surchargeable
            par produit).
          </Text>
        </div>
        {categories.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Aucune catégorie.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Catégorie</Table.HeaderCell>
                <Table.HeaderCell>Ambiance</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map((c) => (
                <Table.Row key={c.id}>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {c.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Select
                      value={categoryAmbianceId(c)}
                      onValueChange={(v) =>
                        assignCategory.mutate({
                          categoryId: c.id,
                          tagId: v === NONE ? null : v,
                        })
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="—" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value={NONE}>— Aucune —</Select.Item>
                        {ambiances.map((a) => (
                          <Select.Item key={a.id} value={a.id}>
                            {a.value}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Ambiances",
  icon: Swatch,
})

export default AmbiancesPage
```

- [ ] **Step 3: Run the build to validate**

Run (depuis `apps/backend`):
```bash
npm run build
```
Expected: build réussi (l'admin compile).

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/admin/components/ambiances apps/backend/src/admin/routes/ambiances
git commit -m "feat(admin): page Ambiances (CRUD tags + assignation par catégorie)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Widget d'ambiance sur la fiche produit

**Files:**
- Create: `apps/backend/src/admin/widgets/product-ambiance.tsx`

**Interfaces:**
- Consumes: `Ambiance`, `AMBIANCES_QUERY_KEY` (Task 5) ; routes `GET/POST /admin/products/:id/ambiance` (Task 4).

- [ ] **Step 1: Write the widget**

Create `apps/backend/src/admin/widgets/product-ambiance.tsx`:

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Ambiance,
  AMBIANCES_QUERY_KEY,
} from "../components/ambiances/types"
import { sdk } from "../lib/client"

const INHERIT = "__inherit__"

const ProductAmbianceWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()

  const { data: ambiancesData } = useQuery<{ ambiances: Ambiance[] }>({
    queryKey: AMBIANCES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/ambiances"),
  })

  const { data: resolvedData } = useQuery<{
    ambiance: { id: string; value: string } | null
  }>({
    queryKey: ["product-ambiance", product.id],
    queryFn: () => sdk.client.fetch(`/admin/products/${product.id}/ambiance`),
  })

  const ambiances = ambiancesData?.ambiances ?? []
  const resolved = resolvedData?.ambiance ?? null
  const overrideId = product.tags?.[0]?.id ?? INHERIT

  const setAmbiance = useMutation({
    mutationFn: (tagId: string | null) =>
      sdk.client.fetch(`/admin/products/${product.id}/ambiance`, {
        method: "POST",
        body: { tag_id: tagId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ambiance", product.id] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Ambiance du produit mise à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec"),
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Ambiance</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Ambiance effective : {resolved ? resolved.value : "aucune"}.
        </Text>
      </div>
      <div className="flex flex-col gap-y-2 px-6 py-4">
        <Select
          value={overrideId}
          onValueChange={(v) => setAmbiance.mutate(v === INHERIT ? null : v)}
        >
          <Select.Trigger>
            <Select.Value placeholder="Hériter de la catégorie" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={INHERIT}>Hériter de la catégorie</Select.Item>
            {ambiances.map((a) => (
              <Select.Item key={a.id} value={a.id}>
                {a.value}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductAmbianceWidget
```

- [ ] **Step 2: Run the build to validate**

Run (depuis `apps/backend`):
```bash
npm run build
```
Expected: build réussi.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/admin/widgets/product-ambiance.tsx
git commit -m "feat(admin): widget d'ambiance sur la fiche produit (surcharge/héritage)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Seed des ambiances

**Files:**
- Modify: `apps/backend/src/migration-scripts/initial-data-seed.ts`

**Interfaces:**
- Consumes: `setProductAmbianceWorkflow` (Task 3) ; `createProductTagsWorkflow`, `updateProductCategoriesWorkflow` (core-flows).

- [ ] **Step 1: Add the imports**

In `apps/backend/src/migration-scripts/initial-data-seed.ts`, add `createProductTagsWorkflow` and `updateProductCategoriesWorkflow` to the existing `@medusajs/medusa/core-flows` import block (the one that already contains `createProductCategoriesWorkflow`), and add a new import for the workflow. At the top with the other imports:

```typescript
import { setProductAmbianceWorkflow } from "../workflows/ambiance/set-product-ambiance";
```

And inside the existing core-flows import list, add these two names:

```typescript
  createProductTagsWorkflow,
  updateProductCategoriesWorkflow,
```

- [ ] **Step 2: Seed the tags and category assignments**

In the same file, immediately **after** the block that builds `categoryIdByName` (the `const categoryIdByName = new Map(...)`) and **before** `await createProductsWorkflow(...)`, insert:

```typescript
  logger.info("Seeding ambiances (product tags).");
  const ambianceValues = ["california", "palm beach", "cozy", "méditerranée"];
  const { result: ambianceTags } = await createProductTagsWorkflow(container).run({
    input: { product_tags: ambianceValues.map((value) => ({ value })) },
  });
  const tagIdByValue = new Map(
    (ambianceTags as { id: string; value: string }[]).map((t) => [t.value, t.id])
  );

  const categoryAmbiance: Record<string, string> = {
    Bougies: "cozy",
    "Bougies Gold": "california",
    Parfums: "méditerranée",
    Céramiques: "palm beach",
  };
  for (const [categoryName, ambianceValue] of Object.entries(categoryAmbiance)) {
    const categoryId = categoryIdByName.get(categoryName);
    const tagId = tagIdByValue.get(ambianceValue);
    if (categoryId && tagId) {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: categoryId },
          update: { metadata: { ambiance_tag_id: tagId } },
        },
      });
    }
  }
```

- [ ] **Step 3: Seed a product override demo**

In the same file, **after** the products are created — immediately after the line `logger.info(\`Finished seeding ${productsData.length} products.\`);` — insert:

```typescript
  // Démo : surcharge d'une bougie avec une ambiance différente de sa catégorie.
  const demoProduct = productsData.find((p) => p.category === "Bougies");
  const californiaId = tagIdByValue.get("california");
  if (demoProduct && californiaId) {
    const { data: demoRows } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { handle: slugify(demoProduct.name) },
    });
    const demoId = (demoRows[0] as { id: string } | undefined)?.id;
    if (demoId) {
      await setProductAmbianceWorkflow(container).run({
        input: { product_id: demoId, tag_id: californiaId },
      });
    }
  }
```

- [ ] **Step 4: Run the build to validate**

Run (depuis `apps/backend`):
```bash
npm run build
```
Expected: build réussi.

- [ ] **Step 5: Run the seed to verify it executes**

Run (depuis `apps/backend`) :
```bash
npm run seed
```
Expected: logs `Seeding ambiances (product tags).` puis `Finished seeding ... products.` sans erreur. (Si `npm run seed` n'existe pas, utiliser la commande de seed du projet, p. ex. `npx medusa exec ./src/migration-scripts/initial-data-seed.ts`.)

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/migration-scripts/initial-data-seed.ts
git commit -m "feat(backend): seed des ambiances (tags + assignation catégories + surcharge démo)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Vérification finale (manuelle)

1. `npm run dev` (depuis `apps/backend`), ouvrir `http://localhost:9000/app`.
2. Sidebar → **Ambiances** : les 4 ambiances apparaissent avec leurs compteurs de catégories.
3. Créer une ambiance, la renommer, la supprimer → toasts OK, compteurs à jour.
4. Dans « Ambiance par catégorie », changer l'ambiance d'une catégorie → persiste au refresh.
5. Ouvrir une fiche produit (une bougie) → widget **Ambiance** : « Ambiance effective » affichée, changer la surcharge (Hériter / une ambiance) → persiste, l'effective se met à jour.
