import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PRODUCT_ATTRIBUTE_MODULE } from "../../../modules/product-attribute"

const categoryLink = (definitionId: string, categoryId: string) => ({
  [PRODUCT_ATTRIBUTE_MODULE]: { attribute_definition_id: definitionId },
  [Modules.PRODUCT]: { product_category_id: categoryId },
})

const productLink = (definitionId: string, productId: string) => ({
  [PRODUCT_ATTRIBUTE_MODULE]: { attribute_definition_id: definitionId },
  [Modules.PRODUCT]: { product_id: productId },
})

/**
 * Aligne l'ensemble des catégories liées à une définition sur `category_ids`
 * (set semantics : crée les manquantes, retire les obsolètes).
 */
export const syncDefinitionCategoriesStep = createStep(
  "sync-definition-categories",
  async (
    input: { definition_id: string; category_ids: string[] },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data } = await query.graph({
      entity: "attribute_definition",
      fields: ["id", "product_categories.id"],
      filters: { id: input.definition_id },
    })
    const current: string[] = (
      (data[0]?.product_categories ?? []) as { id: string }[]
    ).map((c) => c.id)

    const target = new Set(input.category_ids)
    const currentSet = new Set(current)
    const added = input.category_ids.filter((id) => !currentSet.has(id))
    const removed = current.filter((id) => !target.has(id))

    if (added.length) {
      await link.create(added.map((id) => categoryLink(input.definition_id, id)))
    }
    if (removed.length) {
      await link.dismiss(
        removed.map((id) => categoryLink(input.definition_id, id))
      )
    }

    return new StepResponse(
      { added, removed },
      { added, removed, definition_id: input.definition_id }
    )
  },
  async (undo, { container }) => {
    if (!undo) {
      return
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    if (undo.added.length) {
      await link.dismiss(
        undo.added.map((id) => categoryLink(undo.definition_id, id))
      )
    }
    if (undo.removed.length) {
      await link.create(
        undo.removed.map((id) => categoryLink(undo.definition_id, id))
      )
    }
  }
)

/**
 * Ajoute / retire des définitions sur un produit précis (override "ajout").
 */
export const setProductDefinitionLinksStep = createStep(
  "set-product-definition-links",
  async (
    input: {
      product_id: string
      add_definition_ids?: string[]
      remove_definition_ids?: string[]
    },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const added = input.add_definition_ids ?? []
    const removed = input.remove_definition_ids ?? []

    if (added.length) {
      await link.create(added.map((id) => productLink(id, input.product_id)))
    }
    if (removed.length) {
      await link.dismiss(removed.map((id) => productLink(id, input.product_id)))
    }

    return new StepResponse(
      { added, removed },
      { added, removed, product_id: input.product_id }
    )
  },
  async (undo, { container }) => {
    if (!undo) {
      return
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    if (undo.added.length) {
      await link.dismiss(
        undo.added.map((id) => productLink(id, undo.product_id))
      )
    }
    if (undo.removed.length) {
      await link.create(undo.removed.map((id) => productLink(id, undo.product_id)))
    }
  }
)

/**
 * Retire tous les liens (catégories + produits) d'une définition — avant suppression.
 */
export const dismissDefinitionLinksStep = createStep(
  "dismiss-definition-links",
  async (definitionId: string, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data } = await query.graph({
      entity: "attribute_definition",
      fields: ["id", "product_categories.id", "products.id"],
      filters: { id: definitionId },
    })
    const categoryIds: string[] = (
      (data[0]?.product_categories ?? []) as { id: string }[]
    ).map((c) => c.id)
    const productIds: string[] = (
      (data[0]?.products ?? []) as { id: string }[]
    ).map((p) => p.id)

    if (categoryIds.length) {
      await link.dismiss(
        categoryIds.map((id) => categoryLink(definitionId, id))
      )
    }
    if (productIds.length) {
      await link.dismiss(productIds.map((id) => productLink(definitionId, id)))
    }

    return new StepResponse(
      { categoryIds, productIds },
      { categoryIds, productIds, definitionId }
    )
  },
  async (undo, { container }) => {
    if (!undo) {
      return
    }
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    if (undo.categoryIds.length) {
      await link.create(
        undo.categoryIds.map((id) => categoryLink(undo.definitionId, id))
      )
    }
    if (undo.productIds.length) {
      await link.create(
        undo.productIds.map((id) => productLink(undo.definitionId, id))
      )
    }
  }
)
