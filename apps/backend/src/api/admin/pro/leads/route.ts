import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRO_SPACE_MODULE } from "../../../../modules/pro-space"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const proService = req.scope.resolve(PRO_SPACE_MODULE)

  const [leads, count] = await proService.listAndCountProLeads(
    {},
    { order: { created_at: "DESC" } }
  )

  return res.json({ leads, count })
}
