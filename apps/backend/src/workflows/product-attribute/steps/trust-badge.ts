import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_ATTRIBUTE_MODULE } from "../../../modules/product-attribute"

export type TrustBadgeData = { icon: string; label: string; rank?: number }

export const createTrustBadgeStep = createStep(
  "create-trust-badge",
  async (input: TrustBadgeData, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    const created = await service.createTrustBadges(input)
    return new StepResponse(created, created.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    await service.deleteTrustBadges(id)
  }
)

export type UpdateTrustBadgeInput = Partial<TrustBadgeData> & { id: string }

export const updateTrustBadgeStep = createStep(
  "update-trust-badge",
  async (input: UpdateTrustBadgeInput, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    const previous = await service.retrieveTrustBadge(input.id)
    const updated = await service.updateTrustBadges(input)
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    await service.updateTrustBadges({
      id: previous.id,
      icon: previous.icon,
      label: previous.label,
      rank: previous.rank,
    })
  }
)

export const deleteTrustBadgeStep = createStep(
  "delete-trust-badge",
  async (id: string, { container }) => {
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    const previous = await service.retrieveTrustBadge(id)
    await service.deleteTrustBadges(id)
    return new StepResponse(id, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service = container.resolve(PRODUCT_ATTRIBUTE_MODULE)
    await service.createTrustBadges({
      icon: previous.icon,
      label: previous.label,
      rank: previous.rank,
    })
  }
)
