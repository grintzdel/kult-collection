import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createProLeadStep,
  type CreateProLeadInput,
} from "./steps/create-pro-lead"

export const createProLeadWorkflow = createWorkflow(
  "create-pro-lead",
  function (input: CreateProLeadInput) {
    const lead = createProLeadStep(input)
    return new WorkflowResponse(lead)
  }
)

export default createProLeadWorkflow
