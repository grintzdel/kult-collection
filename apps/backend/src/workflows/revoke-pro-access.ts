import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  revokeProAccessStep,
  type RevokeProAccessInput,
} from "./steps/revoke-pro-access"

export const revokeProAccessWorkflow = createWorkflow(
  "revoke-pro-access",
  function (input: RevokeProAccessInput) {
    const result = revokeProAccessStep(input)
    return new WorkflowResponse(result)
  }
)

export default revokeProAccessWorkflow
