import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  AttributeDefinitionData,
  createAttributeDefinitionStep,
} from "./steps/attribute-definition"
import { syncDefinitionCategoriesStep } from "./steps/definition-links"

type Input = AttributeDefinitionData & { category_ids?: string[] }

export const createAttributeDefinitionWorkflow = createWorkflow(
  "create-attribute-definition",
  function (input: Input) {
    const definition = createAttributeDefinitionStep(input)

    const syncInput = transform({ definition, input }, ({ definition, input }) => ({
      definition_id: definition.id,
      category_ids: input.category_ids ?? [],
    }))
    syncDefinitionCategoriesStep(syncInput)

    return new WorkflowResponse(definition)
  }
)

export default createAttributeDefinitionWorkflow
