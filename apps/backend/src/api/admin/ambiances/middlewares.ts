import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const CreateAmbianceSchema = z.object({
  value: z.string().min(1),
})
export type CreateAmbianceSchema = z.infer<typeof CreateAmbianceSchema>

export const UpdateAmbianceSchema = z.object({
  value: z.string().min(1),
})
export type UpdateAmbianceSchema = z.infer<typeof UpdateAmbianceSchema>

export const SetAmbianceSchema = z.object({
  tag_id: z.string().min(1).nullable(),
})
export type SetAmbianceSchema = z.infer<typeof SetAmbianceSchema>

export const ambianceAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/ambiances",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateAmbianceSchema)],
  },
  {
    matcher: "/admin/ambiances/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateAmbianceSchema)],
  },
  {
    matcher: "/admin/products/:id/ambiance",
    method: "POST",
    middlewares: [validateAndTransformBody(SetAmbianceSchema)],
  },
  {
    matcher: "/admin/product-categories/:id/ambiance",
    method: "POST",
    middlewares: [validateAndTransformBody(SetAmbianceSchema)],
  },
]
