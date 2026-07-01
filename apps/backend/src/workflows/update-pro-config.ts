import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertProConfigStep,
  type UpsertProConfigInput,
} from "./steps/upsert-pro-config"

export const updateProConfigWorkflow = createWorkflow(
  "update-pro-config",
  function (input: UpsertProConfigInput) {
    const config = upsertProConfigStep(input)
    return new WorkflowResponse(config)
  }
)

export default updateProConfigWorkflow
