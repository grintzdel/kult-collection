import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createTrustBadgeStep,
  deleteTrustBadgeStep,
  TrustBadgeData,
  UpdateTrustBadgeInput,
  updateTrustBadgeStep,
} from "./steps/trust-badge"

export const createTrustBadgeWorkflow = createWorkflow(
  "create-trust-badge",
  function (input: TrustBadgeData) {
    const badge = createTrustBadgeStep(input)
    return new WorkflowResponse(badge)
  }
)

export const updateTrustBadgeWorkflow = createWorkflow(
  "update-trust-badge",
  function (input: UpdateTrustBadgeInput) {
    const badge = updateTrustBadgeStep(input)
    return new WorkflowResponse(badge)
  }
)

export const deleteTrustBadgeWorkflow = createWorkflow(
  "delete-trust-badge",
  function (input: { id: string }) {
    const id = deleteTrustBadgeStep(input.id)
    return new WorkflowResponse({ id })
  }
)
