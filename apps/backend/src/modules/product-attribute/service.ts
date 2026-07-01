import { MedusaService } from "@medusajs/framework/utils"
import AttributeDefinition from "./models/attribute-definition"
import TrustBadge from "./models/trust-badge"

class ProductAttributeModuleService extends MedusaService({
  AttributeDefinition,
  TrustBadge,
}) {}

export default ProductAttributeModuleService
