import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import { storeProLeadMiddlewares } from "./store/pro/leads/middlewares"
import { adminProMiddlewares } from "./admin/pro/middlewares"

export default defineMiddlewares({
  routes: [
    ...storeProLeadMiddlewares,
    ...adminProMiddlewares,
    {
      matcher: "/store/pro/me",
      method: "GET",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
