import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Envelope } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../../lib/client"

type ProLeadStatus = "pending" | "active" | "revoked"

type ProLead = {
  id: string
  company: string
  vat_or_siret: string | null
  email: string
  message: string | null
  status: ProLeadStatus
  created_at: string
}

const PRO_LEADS_QUERY_KEY = ["pro-leads"]

const STATUS_OPTIONS: { value: ProLeadStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "Accès actif" },
  { value: "revoked", label: "Accès retiré" },
]

const STATUS_COLOR: Record<ProLeadStatus, "grey" | "orange" | "green"> = {
  pending: "orange",
  active: "green",
  revoked: "grey",
}

const statusLabel = (status: ProLeadStatus) =>
  STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status

const B2BLeadsPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ leads: ProLead[]; count: number }>({
    queryKey: PRO_LEADS_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/pro/leads"),
  })

  const grantAccess = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/pro/leads/${id}/grant`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRO_LEADS_QUERY_KEY })
      toast.success("Accès pro accordé — le client est ajouté au groupe « Pros »")
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Échec — le contact doit d'abord avoir un compte sur le site."
      )
    },
  })

  const revokeAccess = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/pro/leads/${id}/revoke`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRO_LEADS_QUERY_KEY })
      toast.success("Accès pro retiré — le client est sorti du groupe « Pros »")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec du retrait de l'accès")
    },
  })

  const leads = data?.leads ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Demandes d'accès pro</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Traitez les demandes, puis créez le compte client et ajoutez-le au
          groupe « Pros » depuis la section Clients.
        </Text>
      </div>

      {isLoading ? (
        <div className="px-6 py-8">
          <Text size="small" className="text-ui-fg-subtle">
            Chargement…
          </Text>
        </div>
      ) : leads.length === 0 ? (
        <div className="px-6 py-8">
          <Text size="small" className="text-ui-fg-subtle">
            Aucune demande pour le moment.
          </Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Société</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>TVA / SIRET</Table.HeaderCell>
              <Table.HeaderCell>Message</Table.HeaderCell>
              <Table.HeaderCell>Statut</Table.HeaderCell>
              <Table.HeaderCell>Accès pro</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {leads.map((lead) => (
              <Table.Row key={lead.id}>
                <Table.Cell>
                  <Text size="small" weight="plus">
                    {lead.company}
                  </Text>
                </Table.Cell>
                <Table.Cell>{lead.email}</Table.Cell>
                <Table.Cell>{lead.vat_or_siret || "—"}</Table.Cell>
                <Table.Cell className="max-w-xs truncate">
                  {lead.message || "—"}
                </Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={STATUS_COLOR[lead.status]}>
                    {statusLabel(lead.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {lead.status === "active" ? (
                    <div className="flex items-center gap-x-2">
                      <Text size="small" className="text-ui-fg-subtle">
                        Accès accordé ✓
                      </Text>
                      <Button
                        size="small"
                        variant="transparent"
                        className="text-ui-fg-error"
                        isLoading={
                          revokeAccess.isPending &&
                          revokeAccess.variables === lead.id
                        }
                        onClick={() => revokeAccess.mutate(lead.id)}
                      >
                        Retirer
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="small"
                      variant="secondary"
                      isLoading={
                        grantAccess.isPending &&
                        grantAccess.variables === lead.id
                      }
                      onClick={() => grantAccess.mutate(lead.id)}
                    >
                      Accorder l'accès
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Demandes d'accès",
  icon: Envelope,
})

export default B2BLeadsPage
