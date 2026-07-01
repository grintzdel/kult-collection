import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateProLeadStatusStep,
  type UpdateProLeadStatusInput,
} from "./steps/update-pro-lead-status"

export const updateProLeadStatusWorkflow = createWorkflow(
  "update-pro-lead-status",
  function (input: UpdateProLeadStatusInput) {
    const lead = updateProLeadStatusStep(input)
    return new WorkflowResponse(lead)
  }
)

export default updateProLeadStatusWorkflow
