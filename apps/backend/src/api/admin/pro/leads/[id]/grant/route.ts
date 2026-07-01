import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { grantProAccessWorkflow } from "../../../../../../workflows/grant-pro-access"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await grantProAccessWorkflow(req.scope).run({
    input: { leadId: id },
  })

  return res.json({ granted: result })
}
