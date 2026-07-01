import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { revokeProAccessWorkflow } from "../../../../../../workflows/revoke-pro-access"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await revokeProAccessWorkflow(req.scope).run({
    input: { leadId: id },
  })

  return res.json({ revoked: result })
}
