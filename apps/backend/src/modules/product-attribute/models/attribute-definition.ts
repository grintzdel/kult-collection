import { model } from "@medusajs/framework/utils"

/**
 * Définition d'un attribut produit configurable depuis l'admin (EAV).
 *
 * - `key` sert de clé dans `product.metadata` (valeur par produit).
 * - `type` pilote le contrôle de saisie et le rendu (`group` = sous-champs).
 * - `zone` place le champ sur la fiche produit (accroche / specs / accordéon).
 * - `group_fields` (type=group) : `[{ key, label }]` décrivant les sous-champs.
 *
 * Le scoping (catégories / produits) se fait via des module links, pas ici.
 */
const AttributeDefinition = model.define("attribute_definition", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  label: model.text(),
  type: model.enum(["text", "textarea", "group"]).default("text"),
  zone: model.enum(["accroche", "specs", "accordeon"]).default("accordeon"),
  rank: model.number().default(0),
  group_fields: model.json().nullable(),
})

export default AttributeDefinition
