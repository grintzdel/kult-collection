import { model } from "@medusajs/framework/utils"

/**
 * Badge visuel « indication » affiché sur les fiches/cartes produit.
 * Niveau **global app** : une ligne par type (`featured` = produit phare,
 * `new` = nouveau produit). L'image est uploadée depuis les réglages admin
 * et transmet visuellement l'indication ; le rattachement à un produit se
 * fait via `product.metadata.is_featured` / `product.metadata.is_new`.
 */
const ProductBadge = model.define("product_badge", {
  id: model.id().primaryKey(),
  type: model.enum(["featured", "new"]).unique(),
  label: model.text(),
  image_url: model.text().nullable(),
  // Coin de l'image produit où le badge est affiché (storefront).
  position: model
    .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
    .default("top-left"),
})

export default ProductBadge
