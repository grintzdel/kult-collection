import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRO_SPACE_MODULE } from "../../../../modules/pro-space"
import { updateProConfigWorkflow } from "../../../../workflows/update-pro-config"
import type { UpdateProConfigSchema } from "../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const proService = req.scope.resolve(PRO_SPACE_MODULE)
  const [config] = await proService.listProConfigs({}, { take: 1 })

  return res.json({
    config: {
      active: config?.active ?? false,
      online_purchase_enabled: config?.online_purchase_enabled ?? false,
      min_order_amount: config?.min_order_amount ?? 0,
      currency_code: config?.currency_code ?? "eur",
      display_ht: config?.display_ht ?? true,
    },
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateProConfigSchema>,
  res: MedusaResponse
) {
  const { result } = await updateProConfigWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json({ config: result })
}
