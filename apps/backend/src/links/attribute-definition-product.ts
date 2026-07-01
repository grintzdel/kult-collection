import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductAttributeModule from "../modules/product-attribute"

/**
 * Override produit (ajout) : un produit peut porter des définitions
 * supplémentaires hors de celles héritées de ses catégories (many-to-many).
 * Le masquage d'un champ hérité vit dans `product.metadata.attr_hidden`.
 */
export default defineLink(
  {
    linkable: ProductAttributeModule.linkable.attributeDefinition,
    isList: true,
  },
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
)
