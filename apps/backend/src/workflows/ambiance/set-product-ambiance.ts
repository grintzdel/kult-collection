import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type Input = {
  product_id: string
  tag_id: string | null
}

/**
 * Écrit la surcharge d'ambiance d'un produit via ses tags natifs.
 * `tag_id` null → aucun tag (le produit hérite de sa catégorie).
 */
export const setProductAmbianceWorkflow = createWorkflow(
  "set-product-ambiance",
  function (input: Input) {
    const updateInput = transform({ input }, ({ input }) => ({
      selector: { id: input.product_id },
      update: {
        tag_ids: input.tag_id ? [input.tag_id] : [],
      },
    }))

    const result = updateProductsWorkflow.runAsStep({ input: updateInput })

    return new WorkflowResponse(result)
  }
)

export default setProductAmbianceWorkflow
