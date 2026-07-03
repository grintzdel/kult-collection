import { MedusaService } from "@medusajs/framework/utils"
import AttributeDefinition from "./models/attribute-definition"
import ProductBadge from "./models/product-badge"
import TrustBadge from "./models/trust-badge"

class ProductAttributeModuleService extends MedusaService({
  AttributeDefinition,
  ProductBadge,
  TrustBadge,
}) {}

export default ProductAttributeModuleService
