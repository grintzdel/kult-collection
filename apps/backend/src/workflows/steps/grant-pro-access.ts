import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  PRO_CUSTOMER_GROUP_NAME,
  PRO_SPACE_MODULE,
} from "../../modules/pro-space"
import type { ProLeadStatus } from "./update-pro-lead-status"

export type GrantProAccessInput = {
  leadId: string
}

type Compensation = {
  leadId: string
  previousStatus: ProLeadStatus
  customerId: string
  groupId: string
  addedToGroup: boolean
  createdGroup: boolean
}

/**
 * Accorde l'accès pro à partir d'un lead : retrouve le compte client par email,
 * garantit l'existence du groupe « Pros », y ajoute le client (idempotent), puis
 * marque le lead comme active. Échoue proprement si aucun compte n'existe.
 */
export const grantProAccessStep = createStep(
  "grant-pro-access",
  async ({ leadId }: GrantProAccessInput, { container }) => {
    const proService = container.resolve(PRO_SPACE_MODULE)
    const customerService = container.resolve(Modules.CUSTOMER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const lead = await proService.retrieveProLead(leadId).catch(() => null)
    if (!lead) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Demande ${leadId} introuvable`
      )
    }

    const [customer] = await customerService.listCustomers(
      { email: lead.email },
      { take: 1 }
    )
    if (!customer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Aucun compte client pour cet email — le contact doit d'abord s'inscrire sur le site."
      )
    }

    // Garantir le groupe Pros (auto-création au premier grant).
    let [group] = await customerService.listCustomerGroups(
      { name: PRO_CUSTOMER_GROUP_NAME },
      { take: 1 }
    )
    let createdGroup = false
    if (!group) {
      const [created] = await customerService.createCustomerGroups([
        { name: PRO_CUSTOMER_GROUP_NAME },
      ])
      group = created
      createdGroup = true
    }

    // Ajout idempotent : ne rien faire si le client est déjà dans le groupe.
    const { data: customerWithGroups } = await query.graph({
      entity: "customer",
      fields: ["id", "groups.id"],
      filters: { id: customer.id },
    })
    const alreadyMember = (customerWithGroups?.[0]?.groups ?? []).some(
      (g) => g?.id === group.id
    )

    let addedToGroup = false
    if (!alreadyMember) {
      await customerService.addCustomerToGroup([
        { customer_id: customer.id, customer_group_id: group.id },
      ])
      addedToGroup = true
    }

    const previousStatus = lead.status as ProLeadStatus
    await proService.updateProLeads({ id: leadId, status: "active" })

    const compensation: Compensation = {
      leadId,
      previousStatus,
      customerId: customer.id,
      groupId: group.id,
      addedToGroup,
      createdGroup,
    }

    return new StepResponse(
      { leadId, customerId: customer.id, groupId: group.id },
      compensation
    )
  },
  async (comp: Compensation | undefined, { container }) => {
    if (!comp) return
    const proService = container.resolve(PRO_SPACE_MODULE)
    const customerService = container.resolve(Modules.CUSTOMER)

    if (comp.addedToGroup) {
      await customerService
        .removeCustomerFromGroup([
          { customer_id: comp.customerId, customer_group_id: comp.groupId },
        ])
        .catch(() => {})
    }
    if (comp.createdGroup) {
      await customerService.deleteCustomerGroups(comp.groupId).catch(() => {})
    }
    await proService
      .updateProLeads({ id: comp.leadId, status: comp.previousStatus })
      .catch(() => {})
  }
)
