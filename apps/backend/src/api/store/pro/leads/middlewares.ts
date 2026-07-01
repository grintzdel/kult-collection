import { validateAndTransformBody } from "@medusajs/framework/http"
import type { MiddlewareRoute } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const CreateProLeadSchema = z.object({
  company: z.string().min(1),
  email: z.string().email(),
  vat_or_siret: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
})

export type CreateProLeadSchema = z.infer<typeof CreateProLeadSchema>

export const storeProLeadMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/pro/leads",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateProLeadSchema)],
  },
]
