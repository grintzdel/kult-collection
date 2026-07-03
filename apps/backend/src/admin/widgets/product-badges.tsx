import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Switch, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/client"

type Flag = "is_featured" | "is_new"

const ProductBadgesWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()

  const metadata = (product.metadata ?? {}) as Record<string, unknown>
  const isFeatured = metadata.is_featured === true
  const isNew = metadata.is_new === true

  const setFlag = useMutation({
    mutationFn: ({ flag, value }: { flag: Flag; value: boolean }) =>
      sdk.admin.product.update(product.id, {
        metadata: { ...metadata, [flag]: value },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Indications produit mises à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec"),
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Indications</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Badges affichés sur la fiche et la carte produit.
        </Text>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <Text size="small" weight="plus">
            Produit phare
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Affiche le badge « phare » sur le produit.
          </Text>
        </div>
        <Switch
          checked={isFeatured}
          disabled={setFlag.isPending}
          onCheckedChange={(value) =>
            setFlag.mutate({ flag: "is_featured", value })
          }
        />
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <Text size="small" weight="plus">
            Nouveau produit
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Affiche le badge « nouveau » sur le produit.
          </Text>
        </div>
        <Switch
          checked={isNew}
          disabled={setFlag.isPending}
          onCheckedChange={(value) => setFlag.mutate({ flag: "is_new", value })}
        />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductBadgesWidget
