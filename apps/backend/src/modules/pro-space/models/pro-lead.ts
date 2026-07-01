import { model } from "@medusajs/framework/utils"

/**
 * Demande d'accès pro déposée depuis la landing /pro.
 * L'admin traite le lead puis crée manuellement le compte client + l'ajoute au groupe Pros.
 */
const ProLead = model.define("pro_lead", {
  id: model.id().primaryKey(),
  company: model.text(),
  vat_or_siret: model.text().nullable(),
  email: model.text(),
  message: model.text().nullable(),
  status: model.enum(["pending", "active", "revoked"]).default("pending"),
})

export default ProLead
