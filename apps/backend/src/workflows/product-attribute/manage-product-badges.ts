import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  UpsertProductBadgeInput,
  upsertProductBadgeStep,
} from "./steps/product-badge"

export const upsertProductBadgeWorkflow = createWorkflow(
  "upsert-product-badge",
  function (input: UpsertProductBadgeInput) {
    const badge = upsertProductBadgeStep(input)
    return new WorkflowResponse(badge)
  }
)
