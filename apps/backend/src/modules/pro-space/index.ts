import { Module } from "@medusajs/framework/utils"
import ProSpaceModuleService from "./service"

export const PRO_SPACE_MODULE = "proSpace"

/**
 * Nom du customer group natif qui identifie les comptes pro.
 * Source de vérité unique du mode B2B (côté serveur ET storefront).
 * Le group est créé/géré manuellement dans l'admin Medusa.
 */
export const PRO_CUSTOMER_GROUP_NAME = "Pros"

export default Module(PRO_SPACE_MODULE, {
  service: ProSpaceModuleService,
})
