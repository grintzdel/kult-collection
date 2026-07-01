import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setProductDefinitionLinksStep } from "./steps/definition-links"

type Input = {
  product_id: string
  add_definition_ids?: string[]
  remove_definition_ids?: string[]
}

export const setProductDefinitionLinksWorkflow = createWorkflow(
  "set-product-definition-links",
  function (input: Input) {
    const result = setProductDefinitionLinksStep(input)
    return new WorkflowResponse(result)
  }
)

export default setProductDefinitionLinksWorkflow
