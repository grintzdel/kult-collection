import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { sdk } from "../../lib/client"

const PRODUCT_BADGES_QUERY_KEY = ["product-badges"]

type BadgePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"

type ProductBadge = {
  id: string
  type: "featured" | "new"
  label: string
  image_url: string | null
  position: BadgePosition
}

const POSITION_OPTIONS: { value: BadgePosition; label: string }[] = [
  { value: "top-left", label: "En haut à gauche" },
  { value: "top-right", label: "En haut à droite" },
  { value: "bottom-left", label: "En bas à gauche" },
  { value: "bottom-right", label: "En bas à droite" },
]

const BADGE_META: Record<
  ProductBadge["type"],
  { title: string; description: string }
> = {
  featured: {
    title: "Produit phare",
    description: "Image affichée sur les produits marqués « phare ».",
  },
  new: {
    title: "Nouveau produit",
    description: "Image affichée sur les produits marqués « nouveau ».",
  },
}

const BadgeCard = ({ badge }: { badge: ProductBadge }) => {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const meta = BADGE_META[badge.type]

  const save = useMutation({
    mutationFn: (patch: { image_url?: string; position?: BadgePosition }) =>
      sdk.client.fetch("/admin/product-badges", {
        method: "POST",
        body: { type: badge.type, ...patch },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_BADGES_QUERY_KEY })
      toast.success(`Badge « ${meta.title} » mis à jour`)
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'enregistrement"),
  })

  const onFile = async (file: File) => {
    try {
      setUploading(true)
      const { files } = await sdk.admin.upload.create({ files: [file] })
      const url = files?.[0]?.url
      if (!url) {
        throw new Error("Upload sans URL")
      }
      await save.mutateAsync({ image_url: url })
    } catch (e) {
      toast.error((e as Error).message || "Échec de l'upload")
    } finally {
      setUploading(false)
      if (fileRef.current) {
        fileRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex items-start justify-between gap-x-4 px-6 py-4">
      <div className="flex items-center gap-x-4">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          {badge.image_url ? (
            <img
              src={badge.image_url}
              alt={meta.title}
              className="size-full object-contain"
            />
          ) : (
            <Text size="xsmall" className="text-ui-fg-muted">
              Aucune
            </Text>
          )}
        </div>
        <div className="flex flex-col">
          <Text size="small" weight="plus">
            {meta.title}
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            {meta.description}
          </Text>
        </div>
      </div>
      <div className="flex items-end gap-x-3">
        <div className="flex flex-col gap-y-1">
          <Label size="xsmall" weight="plus" className="text-ui-fg-subtle">
            Position sur l'image
          </Label>
          <Select
            size="small"
            value={badge.position}
            disabled={save.isPending}
            onValueChange={(value) =>
              save.mutate({ position: value as BadgePosition })
            }
          >
            <Select.Trigger className="w-44">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {POSITION_OPTIONS.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              void onFile(file)
            }
          }}
        />
        <Button
          size="small"
          variant="secondary"
          isLoading={uploading || save.isPending}
          onClick={() => fileRef.current?.click()}
        >
          {badge.image_url ? "Remplacer l'image" : "Uploader une image"}
        </Button>
      </div>
    </div>
  )
}

const ProductBadgesPage = () => {
  const { data, isLoading } = useQuery<{ product_badges: ProductBadge[] }>({
    queryKey: PRODUCT_BADGES_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/product-badges"),
  })

  const badges = data?.product_badges ?? []
  const byType = (type: ProductBadge["type"]) =>
    badges.find((b) => b.type === type) ?? {
      id: type,
      type,
      label: BADGE_META[type].title,
      image_url: null,
      position: "top-left" as BadgePosition,
    }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Badges produit</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Images d'indication « produit phare » et « nouveau produit ». Elles
          s'affichent sur les produits cochés côté fiche produit.
        </Text>
      </div>

      {isLoading ? (
        <div className="px-6 py-8">
          <Text size="small" className="text-ui-fg-subtle">
            Chargement…
          </Text>
        </div>
      ) : (
        <>
          <BadgeCard badge={byType("featured")} />
          <BadgeCard badge={byType("new")} />
        </>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Badges produit",
  icon: Sparkles,
})

export default ProductBadgesPage
