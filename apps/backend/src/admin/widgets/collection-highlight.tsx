import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Label, Switch, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"

/**
 * Widget de mise en avant d'un produit sur la page Collection :
 * - « Mettre en avant » => `metadata.highlight` (rendu seul sur la 1ʳᵉ ligne).
 * - « Badge nouveauté » => `metadata.is_new` (pastille « new » sur la carte).
 */
const asBool = (value: unknown): boolean =>
  value === true || value === "true" || value === 1

const CollectionHighlightWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const metadata = (product.metadata ?? {}) as Record<string, unknown>

  const [highlight, setHighlight] = useState(asBool(metadata.highlight))
  const [isNew, setIsNew] = useState(asBool(metadata.is_new))

  const save = useMutation({
    mutationFn: (patch: { highlight: boolean; is_new: boolean }) =>
      sdk.admin.product.update(product.id, {
        metadata: { ...metadata, highlight: patch.highlight, is_new: patch.is_new },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Mise en avant enregistrée")
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'enregistrement"),
  })

  const toggleHighlight = (value: boolean) => {
    setHighlight(value)
    save.mutate({ highlight: value, is_new: isNew })
  }
  const toggleNew = (value: boolean) => {
    setIsNew(value)
    save.mutate({ highlight: highlight, is_new: value })
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Page Collection</Heading>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Label size="small" weight="plus">
            Mettre en avant
          </Label>
          <Text size="small" className="text-ui-fg-subtle">
            Affiché seul sur la première ligne de la page Collection.
          </Text>
        </div>
        <Switch checked={highlight} onCheckedChange={toggleHighlight} />
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Label size="small" weight="plus">
            Badge nouveauté
          </Label>
          <Text size="small" className="text-ui-fg-subtle">
            Affiche une pastille « new » sur la carte.
          </Text>
        </div>
        <Switch checked={isNew} onCheckedChange={toggleNew} />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default CollectionHighlightWidget
