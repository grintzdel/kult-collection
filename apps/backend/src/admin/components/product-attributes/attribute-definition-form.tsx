import {
  Button,
  Checkbox,
  Drawer,
  FocusModal,
  IconButton,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"
import {
  AttributeDefinition,
  AttributeType,
  AttributeZone,
  GroupField,
  LinkedCategory,
  PRODUCT_ATTRIBUTES_QUERY_KEY,
  TYPE_OPTIONS,
  ZONE_OPTIONS,
} from "./types"

type FormState = {
  key: string
  label: string
  type: AttributeType
  zone: AttributeZone
  rank: string
  group_fields: GroupField[]
  category_ids: string[]
}

const emptyForm = (): FormState => ({
  key: "",
  label: "",
  type: "text",
  zone: "accordeon",
  rank: "0",
  group_fields: [{ key: "", label: "" }],
  category_ids: [],
})

const toForm = (def: AttributeDefinition): FormState => ({
  key: def.key,
  label: def.label,
  type: def.type,
  zone: def.zone,
  rank: String(def.rank ?? 0),
  group_fields:
    def.group_fields && def.group_fields.length > 0
      ? def.group_fields
      : [{ key: "", label: "" }],
  category_ids: (def.product_categories ?? []).map((c) => c.id),
})

const FormBody = ({
  form,
  setForm,
  categories,
  isEdit,
}: {
  form: FormState
  setForm: (updater: (prev: FormState) => FormState) => void
  categories: LinkedCategory[]
  isEdit: boolean
}) => (
  <div className="flex flex-col gap-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-y-2">
        <Label size="small" weight="plus">
          Clé (metadata)
        </Label>
        <Input
          value={form.key}
          disabled={isEdit}
          placeholder="pyramide"
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
            }))
          }
        />
        {isEdit && (
          <Text size="xsmall" className="text-ui-fg-subtle">
            La clé n'est pas modifiable (elle porte les valeurs déjà saisies).
          </Text>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <Label size="small" weight="plus">
          Libellé
        </Label>
        <Input
          value={form.label}
          placeholder="Pyramide olfactive"
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col gap-y-2">
        <Label size="small" weight="plus">
          Type
        </Label>
        <Select
          value={form.type}
          onValueChange={(v) => setForm((p) => ({ ...p, type: v as AttributeType }))}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {TYPE_OPTIONS.map((o) => (
              <Select.Item key={o.value} value={o.value}>
                {o.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-y-2">
        <Label size="small" weight="plus">
          Zone
        </Label>
        <Select
          value={form.zone}
          onValueChange={(v) => setForm((p) => ({ ...p, zone: v as AttributeZone }))}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {ZONE_OPTIONS.map((o) => (
              <Select.Item key={o.value} value={o.value}>
                {o.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-y-2">
        <Label size="small" weight="plus">
          Ordre
        </Label>
        <Input
          type="number"
          value={form.rank}
          onChange={(e) => setForm((p) => ({ ...p, rank: e.target.value }))}
        />
      </div>
    </div>

    {form.type === "group" && (
      <div className="flex flex-col gap-y-2 rounded-lg border border-ui-border-base p-3">
        <Text size="small" weight="plus">
          Sous-champs
        </Text>
        {form.group_fields.map((field, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-y-1">
              <Label size="xsmall">Clé</Label>
              <Input
                value={field.key}
                placeholder="tete"
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    group_fields: p.group_fields.map((f, j) =>
                      j === i
                        ? {
                            ...f,
                            key: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, "_"),
                          }
                        : f
                    ),
                  }))
                }
              />
            </div>
            <div className="flex flex-1 flex-col gap-y-1">
              <Label size="xsmall">Libellé</Label>
              <Input
                value={field.label}
                placeholder="Tête"
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    group_fields: p.group_fields.map((f, j) =>
                      j === i ? { ...f, label: e.target.value } : f
                    ),
                  }))
                }
              />
            </div>
            <IconButton
              size="small"
              variant="transparent"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  group_fields: p.group_fields.filter((_, j) => j !== i),
                }))
              }
            >
              <Trash />
            </IconButton>
          </div>
        ))}
        <Button
          size="small"
          variant="secondary"
          onClick={() =>
            setForm((p) => ({
              ...p,
              group_fields: [...p.group_fields, { key: "", label: "" }],
            }))
          }
        >
          <Plus />
          Ajouter un sous-champ
        </Button>
      </div>
    )}

    <div className="flex flex-col gap-y-2">
      <Label size="small" weight="plus">
        Catégories concernées
      </Label>
      <Text size="xsmall" className="text-ui-fg-subtle">
        Le champ s'appliquera aux produits de ces catégories (aucune = uniquement
        via ajout manuel par produit).
      </Text>
      <div className="flex flex-col gap-y-2 pt-1">
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-x-2">
            <Checkbox
              checked={form.category_ids.includes(cat.id)}
              onCheckedChange={(checked) =>
                setForm((p) => ({
                  ...p,
                  category_ids: checked
                    ? [...p.category_ids, cat.id]
                    : p.category_ids.filter((id) => id !== cat.id),
                }))
              }
            />
            <Text size="small">{cat.name}</Text>
          </label>
        ))}
      </div>
    </div>
  </div>
)

export const AttributeDefinitionForm = ({
  open,
  onOpenChange,
  mode,
  definition,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  definition?: AttributeDefinition
  categories: LinkedCategory[]
}) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(mode === "edit" && definition ? toForm(definition) : emptyForm())
    }
  }, [open, mode, definition])

  const buildBody = () => {
    const group_fields =
      form.type === "group"
        ? form.group_fields.filter((f) => f.key.trim() && f.label.trim())
        : null
    return {
      label: form.label.trim(),
      type: form.type,
      zone: form.zone,
      rank: Number(form.rank) || 0,
      group_fields,
      category_ids: form.category_ids,
    }
  }

  const mutation = useMutation({
    mutationFn: () => {
      if (mode === "create") {
        return sdk.client.fetch("/admin/product-attributes", {
          method: "POST",
          body: { key: form.key.trim(), ...buildBody() },
        })
      }
      return sdk.client.fetch(`/admin/product-attributes/${definition!.id}`, {
        method: "POST",
        body: buildBody(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_ATTRIBUTES_QUERY_KEY })
      toast.success(mode === "create" ? "Attribut créé" : "Attribut mis à jour")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de l'enregistrement")
    },
  })

  const canSubmit =
    form.label.trim().length > 0 &&
    (mode === "edit" || form.key.trim().length > 0)

  const submit = () => {
    if (!canSubmit) {
      toast.error("La clé et le libellé sont obligatoires")
      return
    }
    mutation.mutate()
  }

  if (mode === "edit") {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Modifier l'attribut</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto">
            <FormBody
              form={form}
              setForm={setForm}
              categories={categories}
              isEdit
            />
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" disabled={mutation.isPending}>
                Annuler
              </Button>
            </Drawer.Close>
            <Button size="small" isLoading={mutation.isPending} onClick={submit}>
              Enregistrer
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    )
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <div className="flex items-center justify-end gap-x-2">
            <FocusModal.Close asChild>
              <Button size="small" variant="secondary" disabled={mutation.isPending}>
                Annuler
              </Button>
            </FocusModal.Close>
            <Button size="small" isLoading={mutation.isPending} onClick={submit}>
              Créer
            </Button>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-1 flex-col items-center overflow-auto py-8">
          <div className="w-full max-w-2xl">
            <FormBody
              form={form}
              setForm={setForm}
              categories={categories}
              isEdit={false}
            />
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
