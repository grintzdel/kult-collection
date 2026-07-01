import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { updateProLeadStatusWorkflow } from "../../../../../workflows/update-pro-lead-status"
import type { UpdateProLeadStatusSchema } from "../../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateProLeadStatusSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await updateProLeadStatusWorkflow(req.scope).run({
    input: { id, status: req.validatedBody.status },
  })

  return res.json({ lead: result })
}
