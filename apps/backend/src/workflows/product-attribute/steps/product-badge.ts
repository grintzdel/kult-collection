import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_ATTRIBUTE_MODULE } from "../../../modules/product-attribute"

export type ProductBadgeType = "featured" | "new"

export type ProductBadgePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"

export type UpsertProductBadgeInput = {
  type: ProductBadgeType
  label?: string
  image_url?: string | null
  position?: ProductBadgePosition
}

type ProductBadgeRecord = {
  id: string
  type: ProductBadgeType
  label: string
  image_url: string | null
  position: ProductBadgePosition
}

type Compensate = {
  createdId: string | null
  previous: ProductBadgeRecord | null
}

/**
 * Upsert idempotent d'un badge produit par `type` (une seule ligne par type).
 * Crée la ligne si absente, sinon met à jour label / image_url.
 */
export const upsertProductBadgeStep = createStep(
  "upsert-product-badge",
  async (input: UpsertProductBadgeInput, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)

    const [existing] = await service.listProductBadges({ type: input.type })

    if (existing) {
      const updated = await service.updateProductBadges({
        id: existing.id,
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.image_url !== undefined ? { image_url: input.image_url } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
      })
      const compensate: Compensate = {
        createdId: null,
        previous: existing as ProductBadgeRecord,
      }
      return new StepResponse(updated, compensate)
    }

    const created = await service.createProductBadges({
      type: input.type,
      label: input.label ?? input.type,
      image_url: input.image_url ?? null,
      ...(input.position !== undefined ? { position: input.position } : {}),
    })
    const compensate: Compensate = { createdId: created.id, previous: null }
    return new StepResponse(created, compensate)
  },
  async (compensate: Compensate | undefined, { container }) => {
    if (!compensate) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    if (compensate.createdId) {
      await service.deleteProductBadges(compensate.createdId)
    } else if (compensate.previous) {
      await service.updateProductBadges({
        id: compensate.previous.id,
        label: compensate.previous.label,
        image_url: compensate.previous.image_url,
        position: compensate.previous.position,
      })
    }
  }
)
