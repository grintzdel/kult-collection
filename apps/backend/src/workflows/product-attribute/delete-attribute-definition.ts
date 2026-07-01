import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteAttributeDefinitionStep } from "./steps/attribute-definition"
import { dismissDefinitionLinksStep } from "./steps/definition-links"

export const deleteAttributeDefinitionWorkflow = createWorkflow(
  "delete-attribute-definition",
  function (input: { id: string }) {
    dismissDefinitionLinksStep(input.id)
    const id = deleteAttributeDefinitionStep(input.id)
    return new WorkflowResponse({ id })
  }
)

export default deleteAttributeDefinitionWorkflow
