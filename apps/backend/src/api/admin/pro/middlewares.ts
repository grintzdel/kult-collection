import { validateAndTransformBody } from "@medusajs/framework/http"
import type { MiddlewareRoute } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const UpdateProConfigSchema = z.object({
  active: z.boolean().optional(),
  online_purchase_enabled: z.boolean().optional(),
  min_order_amount: z.number().min(0).optional(),
  currency_code: z.string().min(1).optional(),
  display_ht: z.boolean().optional(),
})

export type UpdateProConfigSchema = z.infer<typeof UpdateProConfigSchema>

export const UpdateProLeadStatusSchema = z.object({
  status: z.enum(["pending", "active", "revoked"]),
})

export type UpdateProLeadStatusSchema = z.infer<
  typeof UpdateProLeadStatusSchema
>

export const SetProPriceTiersSchema = z.object({
  variant_id: z.string().min(1),
  currency_code: z.string().min(1),
  tiers: z
    .array(
      z.object({
        min_quantity: z.number().int().min(1),
        max_quantity: z.number().int().min(1).nullish(),
        // Réduction en % (0–100) appliquée au prix de base du variant.
        discount_percent: z.number().min(0).max(100),
      })
    )
    .min(1),
})

export type SetProPriceTiersSchema = z.infer<typeof SetProPriceTiersSchema>

export const adminProMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/pro/config",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateProConfigSchema)],
  },
  {
    matcher: "/admin/pro/leads/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateProLeadStatusSchema)],
  },
  {
    matcher: "/admin/pro/price-tiers",
    method: "POST",
    middlewares: [validateAndTransformBody(SetProPriceTiersSchema)],
  },
]
