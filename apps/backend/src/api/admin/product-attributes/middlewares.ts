import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

const GroupFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
})

export const CreateAttributeDefinitionSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, "Utilisez uniquement minuscules, chiffres et _"),
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "group"]),
  zone: z.enum(["accroche", "specs", "accordeon"]),
  rank: z.number().int().optional(),
  group_fields: z.array(GroupFieldSchema).nullish(),
  category_ids: z.array(z.string()).optional(),
})
export type CreateAttributeDefinitionSchema = z.infer<
  typeof CreateAttributeDefinitionSchema
>

export const UpdateAttributeDefinitionSchema = z.object({
  label: z.string().min(1).optional(),
  type: z.enum(["text", "textarea", "group"]).optional(),
  zone: z.enum(["accroche", "specs", "accordeon"]).optional(),
  rank: z.number().int().optional(),
  group_fields: z.array(GroupFieldSchema).nullish(),
  category_ids: z.array(z.string()).optional(),
})
export type UpdateAttributeDefinitionSchema = z.infer<
  typeof UpdateAttributeDefinitionSchema
>

export const SetProductLinksSchema = z.object({
  add_definition_ids: z.array(z.string()).optional(),
  remove_definition_ids: z.array(z.string()).optional(),
})
export type SetProductLinksSchema = z.infer<typeof SetProductLinksSchema>

export const CreateTrustBadgeSchema = z.object({
  icon: z.string().min(1),
  label: z.string().min(1),
  rank: z.number().int().optional(),
})
export type CreateTrustBadgeSchema = z.infer<typeof CreateTrustBadgeSchema>

export const UpdateTrustBadgeSchema = z.object({
  icon: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  rank: z.number().int().optional(),
})
export type UpdateTrustBadgeSchema = z.infer<typeof UpdateTrustBadgeSchema>

export const productAttributeAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/product-attributes",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateAttributeDefinitionSchema)],
  },
  {
    matcher: "/admin/product-attributes/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateAttributeDefinitionSchema)],
  },
  {
    matcher: "/admin/products/:id/attributes/link",
    method: "POST",
    middlewares: [validateAndTransformBody(SetProductLinksSchema)],
  },
  {
    matcher: "/admin/trust-badges",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateTrustBadgeSchema)],
  },
  {
    matcher: "/admin/trust-badges/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateTrustBadgeSchema)],
  },
]
