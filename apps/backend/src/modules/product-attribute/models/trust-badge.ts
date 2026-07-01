import { model } from "@medusajs/framework/utils"

/**
 * Badge de réassurance affiché sur toutes les fiches produit.
 * Niveau **global app** (pas par produit) — liste ordonnée éditable en admin.
 */
const TrustBadge = model.define("trust_badge", {
  id: model.id().primaryKey(),
  icon: model.text(),
  label: model.text(),
  rank: model.number().default(0),
})

export default TrustBadge
