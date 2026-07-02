import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

type Input = {
  category_id: string
  tag_id: string | null
}

/**
 * Écrit l'ambiance d'une catégorie dans sa metadata (`ambiance_tag_id`).
 * Note : la catégorie ne porte pas d'autre metadata dans cette boutique ; on écrit
 * donc l'objet directement (le workflow natif remplace la metadata).
 */
export const setCategoryAmbianceWorkflow = createWorkflow(
  "set-category-ambiance",
  function (input: Input) {
    const updateInput = transform({ input }, ({ input }) => ({
      selector: { id: input.category_id },
      update: {
        metadata: { ambiance_tag_id: input.tag_id },
      },
    }))

    const result = updateProductCategoriesWorkflow.runAsStep({ input: updateInput })

    return new WorkflowResponse(result)
  }
)

export default setCategoryAmbianceWorkflow
