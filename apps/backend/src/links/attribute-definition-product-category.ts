import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductAttributeModule from "../modules/product-attribute"

/**
 * Scoping par catégorie : une définition d'attribut s'applique à N catégories,
 * une catégorie porte N définitions (many-to-many).
 */
export default defineLink(
  {
    linkable: ProductAttributeModule.linkable.attributeDefinition,
    isList: true,
  },
  {
    linkable: ProductModule.linkable.productCategory,
    isList: true,
  }
)
