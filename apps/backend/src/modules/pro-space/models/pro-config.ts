import { model } from "@medusajs/framework/utils"

/**
 * Singleton de configuration de l'espace pro (B2B).
 * Une seule ligne est censée exister ; les workflows font un upsert.
 */
const ProConfig = model.define("pro_config", {
  id: model.id().primaryKey(),
  // L'espace pro existe / est visible du tout. Si false, KULT est 100% B2C.
  active: model.boolean().default(false),
  // Achat en ligne self-service pour les pros. Si false → mode contact/devis.
  online_purchase_enabled: model.boolean().default(false),
  // Minimum de commande HT (appliqué seulement quand online_purchase_enabled = true).
  min_order_amount: model.number().default(0),
  currency_code: model.text().default("eur"),
  // Afficher les prix HT côté pro.
  display_ht: model.boolean().default(true),
})

export default ProConfig
