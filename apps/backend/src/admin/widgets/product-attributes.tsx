import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  AttributeDefinition,
  typeLabel,
  zoneLabel,
} from "../components/product-attributes/types"
import { sdk } from "../lib/client"

type ResolvedAttribute = AttributeDefinition & {
  value: string | Record<string, string> | null
}

const HIDDEN_KEY = "attr_hidden"

const readHidden = (metadata: Record<string, unknown> | null | undefined): string[] => {
  const raw = metadata?.[HIDDEN_KEY]
  return Array.isArray(raw) ? raw.filter((k): k is string => typeof k === "string") : []
}

const previewValue = (attr: ResolvedAttribute): string => {
  if (attr.type === "group") {
    const entries = Object.entries(attr.value ?? {}).filter(([, v]) => v?.trim())
    return entries.length ? entries.map(([, v]) => v).join(" · ") : "Non renseigné"
  }
  return typeof attr.value === "string" && attr.value.trim() ? attr.value : "Non renseigné"
}

const ProductAttributesWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const resolvedKey = ["product-attributes-resolved", product.id]
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string | Record<string, string>>>({})
  const [addSelection, setAddSelection] = useState<string>("")

  const { data: resolvedData, isLoading } = useQuery<{ attributes: ResolvedAttribute[] }>({
    queryKey: resolvedKey,
    queryFn: () => sdk.client.fetch(`/admin/products/${product.id}/attributes`),
  })

  const { data: allData } = useQuery<{ attribute_definitions: AttributeDefinition[] }>({
    queryKey: ["product-attribute-definitions"],
    queryFn: () => sdk.client.fetch("/admin/product-attributes"),
  })

  const attributes = resolvedData?.attributes ?? []
  const allDefinitions = allData?.attribute_definitions ?? []
  const hiddenKeys = readHidden(product.metadata)

  const shownKeys = new Set(attributes.map((a) => a.key))
  const hiddenDefs = allDefinitions.filter((d) => hiddenKeys.includes(d.key))
  const candidateDefs = allDefinitions.filter(
    (d) => !shownKeys.has(d.key) && !hiddenKeys.includes(d.key)
  )

  useEffect(() => {
    if (open) {
      const initial: Record<string, string | Record<string, string>> = {}
      for (const attr of attributes) {
        if (attr.type === "group") {
          const obj: Record<string, string> = {}
          for (const f of attr.group_fields ?? []) {
            obj[f.key] =
              (attr.value && typeof attr.value === "object" ? attr.value[f.key] : "") ?? ""
          }
          initial[attr.key] = obj
        } else {
          initial[attr.key] = typeof attr.value === "string" ? attr.value : ""
        }
      }
      setValues(initial)
    }
  }, [open, resolvedData])

  const patchMetadata = (patch: Record<string, unknown>) =>
    sdk.admin.product.update(product.id, {
      metadata: { ...(product.metadata ?? {}), ...patch },
    })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: resolvedKey })
    queryClient.invalidateQueries({ queryKey: ["products"] })
  }

  const saveValues = useMutation({
    mutationFn: () => patchMetadata(values),
    onSuccess: () => {
      invalidate()
      toast.success("Valeurs enregistrées")
      setOpen(false)
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'enregistrement"),
  })

  const setHidden = useMutation({
    mutationFn: (nextHidden: string[]) => patchMetadata({ [HIDDEN_KEY]: nextHidden }),
    onSuccess: () => {
      invalidate()
      toast.success("Affichage mis à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec"),
  })

  const addField = useMutation({
    mutationFn: (definitionId: string) =>
      sdk.client.fetch(`/admin/products/${product.id}/attributes/link`, {
        method: "POST",
        body: { add_definition_ids: [definitionId] },
      }),
    onSuccess: () => {
      invalidate()
      setAddSelection("")
      toast.success("Champ ajouté à ce produit")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'ajout"),
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Attributs produit</Heading>
        <Button
          size="small"
          variant="secondary"
          disabled={attributes.length === 0}
          onClick={() => setOpen(true)}
        >
          Modifier les valeurs
        </Button>
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        {isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Chargement…
          </Text>
        ) : attributes.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            Aucun attribut applicable. Ajoutez-en un ci-dessous ou associez des
            attributs aux catégories de ce produit.
          </Text>
        ) : (
          attributes.map((attr) => (
            <div key={attr.key} className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-y-1">
                <Text size="small" leading="compact" weight="plus">
                  {attr.label}{" "}
                  <span className="text-ui-fg-muted">
                    · {typeLabel(attr.type)} · {zoneLabel(attr.zone)}
                  </span>
                </Text>
                <Text
                  size="small"
                  leading="compact"
                  className="whitespace-pre-line text-ui-fg-subtle"
                >
                  {previewValue(attr)}
                </Text>
              </div>
              <Button
                size="small"
                variant="transparent"
                onClick={() => setHidden.mutate([...hiddenKeys, attr.key])}
              >
                Masquer
              </Button>
            </div>
          ))
        )}
      </div>

      {hiddenDefs.length > 0 && (
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Text size="small" weight="plus">
            Champs masqués sur ce produit
          </Text>
          {hiddenDefs.map((def) => (
            <div key={def.key} className="flex items-center justify-between">
              <Text size="small" className="text-ui-fg-subtle">
                {def.label}
              </Text>
              <Button
                size="small"
                variant="transparent"
                onClick={() =>
                  setHidden.mutate(hiddenKeys.filter((k) => k !== def.key))
                }
              >
                Réafficher
              </Button>
            </div>
          ))}
        </div>
      )}

      {candidateDefs.length > 0 && (
        <div className="flex items-end gap-x-2 px-6 py-4">
          <div className="flex flex-1 flex-col gap-y-2">
            <Label size="small" weight="plus">
              Ajouter un champ à ce produit
            </Label>
            <Select value={addSelection} onValueChange={setAddSelection}>
              <Select.Trigger>
                <Select.Value placeholder="Choisir un attribut…" />
              </Select.Trigger>
              <Select.Content>
                {candidateDefs.map((def) => (
                  <Select.Item key={def.id} value={def.id}>
                    {def.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Button
            size="small"
            variant="secondary"
            disabled={!addSelection || addField.isPending}
            isLoading={addField.isPending}
            onClick={() => addField.mutate(addSelection)}
          >
            Ajouter
          </Button>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Valeurs des attributs</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto">
            <div className="flex flex-col gap-y-4">
              {attributes.map((attr) => (
                <div key={attr.key} className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {attr.label}
                  </Label>
                  {attr.type === "group" ? (
                    <div className="flex flex-col gap-y-2 rounded-lg border border-ui-border-base p-3">
                      {(attr.group_fields ?? []).map((f) => (
                        <div key={f.key} className="flex flex-col gap-y-1">
                          <Label size="xsmall">{f.label}</Label>
                          <Input
                            value={
                              ((values[attr.key] as Record<string, string>) ?? {})[
                                f.key
                              ] ?? ""
                            }
                            onChange={(e) =>
                              setValues((p) => ({
                                ...p,
                                [attr.key]: {
                                  ...((p[attr.key] as Record<string, string>) ?? {}),
                                  [f.key]: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : attr.type === "textarea" ? (
                    <Textarea
                      rows={4}
                      value={(values[attr.key] as string) ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [attr.key]: e.target.value }))
                      }
                    />
                  ) : (
                    <Input
                      value={(values[attr.key] as string) ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [attr.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" disabled={saveValues.isPending}>
                Annuler
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              isLoading={saveValues.isPending}
              onClick={() => saveValues.mutate()}
            >
              Enregistrer
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductAttributesWidget
