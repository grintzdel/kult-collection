import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Palette } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  Ambiance,
  AMBIANCES_QUERY_KEY,
  AmbianceCategory,
} from "../../components/ambiances/types"
import { sdk } from "../../lib/client"

const CATEGORIES_KEY = ["ambiance-categories"]
const NONE = "__none__"
const DEFAULT_COLOR = "#FFCA42"

const AmbiancesPage = () => {
  const queryClient = useQueryClient()
  const [newValue, setNewValue] = useState("")
  const [newColor, setNewColor] = useState(DEFAULT_COLOR)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [editingColor, setEditingColor] = useState(DEFAULT_COLOR)

  const { data: ambiancesData, isLoading } = useQuery<{ ambiances: Ambiance[] }>({
    queryKey: AMBIANCES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/ambiances"),
  })

  const { data: categoriesData } = useQuery<{
    product_categories: AmbianceCategory[]
  }>({
    queryKey: CATEGORIES_KEY,
    queryFn: () =>
      sdk.client.fetch("/admin/product-categories", {
        query: { limit: 100, fields: "id,name,metadata" },
      }),
  })

  const ambiances = ambiancesData?.ambiances ?? []
  const categories = categoriesData?.product_categories ?? []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: AMBIANCES_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
  }

  const createAmbiance = useMutation({
    mutationFn: ({ value, color }: { value: string; color: string }) =>
      sdk.client.fetch("/admin/ambiances", {
        method: "POST",
        body: { value, color },
      }),
    onSuccess: () => {
      invalidate()
      setNewValue("")
      setNewColor(DEFAULT_COLOR)
      toast.success("Ambiance créée")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la création"),
  })

  const updateAmbiance = useMutation({
    mutationFn: ({
      id,
      value,
      color,
    }: {
      id: string
      value: string
      color: string
    }) =>
      sdk.client.fetch(`/admin/ambiances/${id}`, {
        method: "POST",
        body: { value, color },
      }),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
      toast.success("Ambiance mise à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la mise à jour"),
  })

  const deleteAmbiance = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/ambiances/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate()
      toast.success("Ambiance supprimée")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la suppression"),
  })

  const assignCategory = useMutation({
    mutationFn: ({
      categoryId,
      tagId,
    }: {
      categoryId: string
      tagId: string | null
    }) =>
      sdk.client.fetch(`/admin/product-categories/${categoryId}/ambiance`, {
        method: "POST",
        body: { tag_id: tagId },
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Ambiance de la catégorie mise à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'assignation"),
  })

  const categoryAmbianceId = (c: AmbianceCategory): string => {
    const raw = c.metadata?.ambiance_tag_id
    return typeof raw === "string" ? raw : NONE
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Ambiances</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Étiquettes d'ambiance (tags produit) attribuées aux catégories,
              surchargeables par produit.
            </Text>
          </div>
        </div>

        <div className="flex items-end gap-x-2 px-6 py-4">
          <div className="flex flex-1 flex-col gap-y-2">
            <Label size="small" weight="plus">
              Nouvelle ambiance
            </Label>
            <Input
              placeholder="ex. california"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Couleur
            </Label>
            <input
              type="color"
              aria-label="Couleur de l'ambiance"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded-md border border-ui-border-base bg-ui-bg-field p-1"
            />
          </div>
          <Button
            size="small"
            variant="secondary"
            disabled={!newValue.trim() || createAmbiance.isPending}
            isLoading={createAmbiance.isPending}
            onClick={() =>
              createAmbiance.mutate({ value: newValue.trim(), color: newColor })
            }
          >
            Ajouter
          </Button>
        </div>

        {isLoading ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Chargement…
            </Text>
          </div>
        ) : ambiances.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Aucune ambiance. Créez-en une ci-dessus.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Ambiance</Table.HeaderCell>
                <Table.HeaderCell>Couleur</Table.HeaderCell>
                <Table.HeaderCell>Catégories</Table.HeaderCell>
                <Table.HeaderCell>Produits surchargés</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ambiances.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell>
                    {editingId === a.id ? (
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <Text size="small" weight="plus">
                        {a.value}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {editingId === a.id ? (
                      <input
                        type="color"
                        aria-label="Couleur de l'ambiance"
                        value={editingColor}
                        onChange={(e) => setEditingColor(e.target.value)}
                        className="h-8 w-12 cursor-pointer rounded-md border border-ui-border-base bg-ui-bg-field p-1"
                      />
                    ) : a.color ? (
                      <div className="flex items-center gap-x-2">
                        <span
                          className="inline-block h-5 w-5 rounded-full border border-ui-border-base"
                          style={{ backgroundColor: a.color }}
                        />
                        <code className="text-ui-fg-subtle">{a.color}</code>
                      </div>
                    ) : (
                      <Text size="small" className="text-ui-fg-muted">
                        —
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>{a.category_count}</Table.Cell>
                  <Table.Cell>{a.product_count}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-x-2">
                      {editingId === a.id ? (
                        <>
                          <Button
                            size="small"
                            variant="transparent"
                            isLoading={updateAmbiance.isPending}
                            disabled={!editingValue.trim()}
                            onClick={() =>
                              updateAmbiance.mutate({
                                id: a.id,
                                value: editingValue.trim(),
                                color: editingColor,
                              })
                            }
                          >
                            Enregistrer
                          </Button>
                          <Button
                            size="small"
                            variant="transparent"
                            onClick={() => setEditingId(null)}
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="transparent"
                            onClick={() => {
                              setEditingId(a.id)
                              setEditingValue(a.value)
                              setEditingColor(a.color ?? DEFAULT_COLOR)
                            }}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="small"
                            variant="transparent"
                            className="text-ui-fg-error"
                            isLoading={
                              deleteAmbiance.isPending &&
                              deleteAmbiance.variables === a.id
                            }
                            onClick={() => deleteAmbiance.mutate(a.id)}
                          >
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Ambiance par catégorie</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Chaque catégorie transmet son ambiance à ses produits (surchargeable
            par produit).
          </Text>
        </div>
        {categories.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Aucune catégorie.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Catégorie</Table.HeaderCell>
                <Table.HeaderCell>Ambiance</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map((c) => (
                <Table.Row key={c.id}>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {c.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Select
                      value={categoryAmbianceId(c)}
                      onValueChange={(v) =>
                        assignCategory.mutate({
                          categoryId: c.id,
                          tagId: v === NONE ? null : v,
                        })
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="—" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value={NONE}>— Aucune —</Select.Item>
                        {ambiances.map((a) => (
                          <Select.Item key={a.id} value={a.id}>
                            {a.value}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Ambiances",
  icon: Palette,
})

export default AmbiancesPage
