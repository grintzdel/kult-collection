import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import { storeProLeadMiddlewares } from "./store/pro/leads/middlewares"
import { adminProMiddlewares } from "./admin/pro/middlewares"
import { productAttributeAdminMiddlewares } from "./admin/product-attributes/middlewares"

export default defineMiddlewares({
  routes: [
    ...storeProLeadMiddlewares,
    ...adminProMiddlewares,
    ...productAttributeAdminMiddlewares,
    {
      matcher: "/store/pro/me",
      method: "GET",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
