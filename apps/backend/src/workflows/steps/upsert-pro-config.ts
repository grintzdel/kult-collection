import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRO_SPACE_MODULE } from "../../modules/pro-space"

export type UpsertProConfigInput = {
  active?: boolean
  online_purchase_enabled?: boolean
  min_order_amount?: number
  currency_code?: string
  display_ht?: boolean
}

type Compensation =
  | { type: "create"; id: string }
  | {
      type: "update"
      prev: {
        id: string
        active: boolean
        online_purchase_enabled: boolean
        min_order_amount: number
        currency_code: string
        display_ht: boolean
      }
    }

/**
 * Upsert du singleton ProConfig : met à jour la ligne existante, sinon la crée.
 */
export const upsertProConfigStep = createStep(
  "upsert-pro-config",
  async (input: UpsertProConfigInput, { container }) => {
    const proService = container.resolve(PRO_SPACE_MODULE)
    const [existing] = await proService.listProConfigs({}, { take: 1 })

    if (existing) {
      const prev: Compensation = {
        type: "update",
        prev: {
          id: existing.id,
          active: existing.active,
          online_purchase_enabled: existing.online_purchase_enabled,
          min_order_amount: existing.min_order_amount,
          currency_code: existing.currency_code,
          display_ht: existing.display_ht,
        },
      }
      const updated = await proService.updateProConfigs({
        id: existing.id,
        ...input,
      })
      return new StepResponse(updated, prev)
    }

    const [created] = await proService.createProConfigs([input])
    return new StepResponse(created, {
      type: "create" as const,
      id: created.id,
    })
  },
  async (comp: Compensation | undefined, { container }) => {
    if (!comp) return
    const proService = container.resolve(PRO_SPACE_MODULE)
    if (comp.type === "create") {
      await proService.deleteProConfigs(comp.id)
      return
    }
    await proService.updateProConfigs({ ...comp.prev })
  }
)
