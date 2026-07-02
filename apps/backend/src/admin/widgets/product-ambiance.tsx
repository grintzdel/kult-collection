import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Ambiance,
  AMBIANCES_QUERY_KEY,
} from "../components/ambiances/types"
import { sdk } from "../lib/client"

const INHERIT = "__inherit__"

const ProductAmbianceWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()

  const { data: ambiancesData } = useQuery<{ ambiances: Ambiance[] }>({
    queryKey: AMBIANCES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/ambiances"),
  })

  const { data: resolvedData } = useQuery<{
    ambiance: { id: string; value: string } | null
  }>({
    queryKey: ["product-ambiance", product.id],
    queryFn: () => sdk.client.fetch(`/admin/products/${product.id}/ambiance`),
  })

  const ambiances = ambiancesData?.ambiances ?? []
  const resolved = resolvedData?.ambiance ?? null
  const overrideId = product.tags?.[0]?.id ?? INHERIT

  const setAmbiance = useMutation({
    mutationFn: (tagId: string | null) =>
      sdk.client.fetch(`/admin/products/${product.id}/ambiance`, {
        method: "POST",
        body: { tag_id: tagId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ambiance", product.id] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Ambiance du produit mise à jour")
    },
    onError: (e: Error) => toast.error(e.message || "Échec"),
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Ambiance</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Ambiance effective : {resolved ? resolved.value : "aucune"}.
        </Text>
      </div>
      <div className="flex flex-col gap-y-2 px-6 py-4">
        <Select
          value={overrideId}
          onValueChange={(v) => setAmbiance.mutate(v === INHERIT ? null : v)}
        >
          <Select.Trigger>
            <Select.Value placeholder="Hériter de la catégorie" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={INHERIT}>Hériter de la catégorie</Select.Item>
            {ambiances.map((a) => (
              <Select.Item key={a.id} value={a.id}>
                {a.value}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductAmbianceWidget
