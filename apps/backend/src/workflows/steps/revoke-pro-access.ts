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

export type RevokeProAccessInput = {
  leadId: string
}

type Compensation = {
  leadId: string
  previousStatus: ProLeadStatus
  customerId?: string
  groupId?: string
  removed: boolean
}

/**
 * Retire l'accès pro : sort le client du groupe « Pros » (s'il y est) et repasse
 * le lead en `revoked` (l'action de grant redevient disponible). Symétrique de
 * grantProAccessStep.
 */
export const revokeProAccessStep = createStep(
  "revoke-pro-access",
  async ({ leadId }: RevokeProAccessInput, { container }) => {
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
    const [group] = await customerService.listCustomerGroups(
      { name: PRO_CUSTOMER_GROUP_NAME },
      { take: 1 }
    )

    let removed = false
    if (customer && group) {
      const { data: customerWithGroups } = await query.graph({
        entity: "customer",
        fields: ["id", "groups.id"],
        filters: { id: customer.id },
      })
      const isMember = (customerWithGroups?.[0]?.groups ?? []).some(
        (g) => g?.id === group.id
      )
      if (isMember) {
        await customerService.removeCustomerFromGroup([
          { customer_id: customer.id, customer_group_id: group.id },
        ])
        removed = true
      }
    }

    const previousStatus = lead.status as ProLeadStatus
    await proService.updateProLeads({ id: leadId, status: "revoked" })

    const compensation: Compensation = {
      leadId,
      previousStatus,
      customerId: customer?.id,
      groupId: group?.id,
      removed,
    }

    return new StepResponse({ leadId, removed }, compensation)
  },
  async (comp: Compensation | undefined, { container }) => {
    if (!comp) return
    const proService = container.resolve(PRO_SPACE_MODULE)
    const customerService = container.resolve(Modules.CUSTOMER)

    if (comp.removed && comp.customerId && comp.groupId) {
      await customerService
        .addCustomerToGroup([
          { customer_id: comp.customerId, customer_group_id: comp.groupId },
        ])
        .catch(() => {})
    }
    await proService
      .updateProLeads({ id: comp.leadId, status: comp.previousStatus })
      .catch(() => {})
  }
)
