import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  grantProAccessStep,
  type GrantProAccessInput,
} from "./steps/grant-pro-access"

export const grantProAccessWorkflow = createWorkflow(
  "grant-pro-access",
  function (input: GrantProAccessInput) {
    const result = grantProAccessStep(input)
    return new WorkflowResponse(result)
  }
)

export default grantProAccessWorkflow
