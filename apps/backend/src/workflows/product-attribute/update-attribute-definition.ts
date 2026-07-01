import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  UpdateAttributeDefinitionInput,
  updateAttributeDefinitionStep,
} from "./steps/attribute-definition"
import { syncDefinitionCategoriesStep } from "./steps/definition-links"

type Input = UpdateAttributeDefinitionInput & { category_ids?: string[] }

export const updateAttributeDefinitionWorkflow = createWorkflow(
  "update-attribute-definition",
  function (input: Input) {
    const definition = updateAttributeDefinitionStep(input)

    // Ne re-synchronise les catégories que si `category_ids` est fourni.
    when({ input }, ({ input }) => input.category_ids !== undefined).then(() => {
      const syncInput = transform({ input }, ({ input }) => ({
        definition_id: input.id,
        category_ids: input.category_ids ?? [],
      }))
      syncDefinitionCategoriesStep(syncInput)
    })

    return new WorkflowResponse(definition)
  }
)

export default updateAttributeDefinitionWorkflow
