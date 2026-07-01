import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProLeadWorkflow } from "../../../../workflows/create-pro-lead"
import type { CreateProLeadSchema } from "./middlewares"

export async function POST(
  req: MedusaRequest<CreateProLeadSchema>,
  res: MedusaResponse
) {
  const { result } = await createProLeadWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.status(201).json({ lead: result })
}
