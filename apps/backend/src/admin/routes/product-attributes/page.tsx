import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"
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
import { useState } from "react"
import { AttributeDefinitionForm } from "../../components/product-attributes/attribute-definition-form"
import { TrustBadgeForm } from "../../components/product-attributes/trust-badge-form"
import {
  AttributeDefinition,
  LinkedCategory,
  PRODUCT_ATTRIBUTES_QUERY_KEY,
  TRUST_BADGES_QUERY_KEY,
  TrustBadge,
  typeLabel,
  zoneLabel,
} from "../../components/product-attributes/types"
import { sdk } from "../../lib/client"

const ProductAttributesPage = () => {
  const queryClient = useQueryClient()

  const { data: definitionsData, isLoading } = useQuery<{
    attribute_definitions: AttributeDefinition[]
  }>({
    queryKey: PRODUCT_ATTRIBUTES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/product-attributes"),
  })

  const { data: categoriesData } = useQuery<{
    product_categories: LinkedCategory[]
  }>({
    queryKey: ["product-categories-for-attributes"],
    queryFn: () =>
      sdk.client.fetch("/admin/product-categories", {
        query: { limit: 100, fields: "id,name" },
      }),
  })

  const { data: badgesData } = useQuery<{ trust_badges: TrustBadge[] }>({
    queryKey: TRUST_BADGES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/trust-badges"),
  })

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editing, setEditing] = useState<AttributeDefinition | undefined>()

  const [badgeFormOpen, setBadgeFormOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<TrustBadge | undefined>()

  const deleteDefinition = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/product-attributes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_ATTRIBUTES_QUERY_KEY })
      toast.success("Attribut supprimé")
    },
    onError: (error: Error) => toast.error(error.message || "Échec de la suppression"),
  })

  const deleteBadge = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/trust-badges/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUST_BADGES_QUERY_KEY })
      toast.success("Badge supprimé")
    },
    onError: (error: Error) => toast.error(error.message || "Échec de la suppression"),
  })

  const definitions = definitionsData?.attribute_definitions ?? []
  const categories = categoriesData?.product_categories ?? []
  const badges = badgesData?.trust_badges ?? []

  const openCreate = () => {
    setFormMode("create")
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (def: AttributeDefinition) => {
    setFormMode("edit")
    setEditing(def)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Attributs produit</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Champs dynamiques affichés sur les fiches produit, scopés par catégorie.
            </Text>
          </div>
          <Button size="small" variant="secondary" onClick={openCreate}>
            Nouvel attribut
          </Button>
        </div>

        {isLoading ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Chargement…
            </Text>
          </div>
        ) : definitions.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Aucun attribut. Créez-en un pour l'afficher sur les fiches produit.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Libellé</Table.HeaderCell>
                <Table.HeaderCell>Clé</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Zone</Table.HeaderCell>
                <Table.HeaderCell>Catégories</Table.HeaderCell>
                <Table.HeaderCell>Ordre</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {definitions.map((def) => (
                <Table.Row key={def.id}>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {def.label}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <code className="text-ui-fg-subtle">{def.key}</code>
                  </Table.Cell>
                  <Table.Cell>{typeLabel(def.type)}</Table.Cell>
                  <Table.Cell>{zoneLabel(def.zone)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {(def.product_categories ?? []).length === 0 ? (
                        <Text size="small" className="text-ui-fg-subtle">
                          —
                        </Text>
                      ) : (
                        (def.product_categories ?? []).map((c) => (
                          <Badge key={c.id} size="2xsmall">
                            {c.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{def.rank}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-x-2">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => openEdit(def)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        className="text-ui-fg-error"
                        isLoading={
                          deleteDefinition.isPending &&
                          deleteDefinition.variables === def.id
                        }
                        onClick={() => deleteDefinition.mutate(def.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Réassurance (global)</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Bandeau affiché sur toutes les fiches produit.
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setEditingBadge(undefined)
              setBadgeFormOpen(true)
            }}
          >
            Nouveau badge
          </Button>
        </div>

        {badges.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Aucun badge de réassurance.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Icône</Table.HeaderCell>
                <Table.HeaderCell>Libellé</Table.HeaderCell>
                <Table.HeaderCell>Ordre</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {badges.map((badge) => (
                <Table.Row key={badge.id}>
                  <Table.Cell>
                    <span className="text-lg">{badge.icon}</span>
                  </Table.Cell>
                  <Table.Cell>{badge.label}</Table.Cell>
                  <Table.Cell>{badge.rank}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-x-2">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => {
                          setEditingBadge(badge)
                          setBadgeFormOpen(true)
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        className="text-ui-fg-error"
                        isLoading={
                          deleteBadge.isPending && deleteBadge.variables === badge.id
                        }
                        onClick={() => deleteBadge.mutate(badge.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <AttributeDefinitionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        definition={editing}
        categories={categories}
      />
      <TrustBadgeForm
        open={badgeFormOpen}
        onOpenChange={setBadgeFormOpen}
        badge={editingBadge}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Attributs produit",
  icon: Tag,
})

export default ProductAttributesPage
