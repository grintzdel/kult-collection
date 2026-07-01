import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PRO_SPACE_MODULE } from "../../modules/pro-space"

export type ProLeadStatus = "pending" | "active" | "revoked"

export type UpdateProLeadStatusInput = {
  id: string
  status: ProLeadStatus
}

export const updateProLeadStatusStep = createStep(
  "update-pro-lead-status",
  async ({ id, status }: UpdateProLeadStatusInput, { container }) => {
    const proService = container.resolve(PRO_SPACE_MODULE)

    const existing = await proService.retrieveProLead(id).catch(() => null)
    if (!existing) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Pro lead ${id} not found`
      )
    }

    const updated = await proService.updateProLeads({ id, status })
    return new StepResponse(updated, {
      id,
      previousStatus: existing.status as ProLeadStatus,
    })
  },
  async (comp, { container }) => {
    if (!comp) return
    const proService = container.resolve(PRO_SPACE_MODULE)
    await proService.updateProLeads({
      id: comp.id,
      status: comp.previousStatus,
    })
  }
)
