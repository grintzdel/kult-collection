import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRO_SPACE_MODULE } from "../../modules/pro-space"

export type CreateProLeadInput = {
  company: string
  email: string
  vat_or_siret?: string | null
  message?: string | null
}

export const createProLeadStep = createStep(
  "create-pro-lead",
  async (input: CreateProLeadInput, { container }) => {
    const proService = container.resolve(PRO_SPACE_MODULE)
    const [lead] = await proService.createProLeads([input])
    return new StepResponse(lead, lead.id)
  },
  async (id, { container }) => {
    if (!id) return
    const proService = container.resolve(PRO_SPACE_MODULE)
    await proService.deleteProLeads(id)
  }
)
