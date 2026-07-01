import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { PencilSquare } from "@medusajs/icons"
import {
  Button,
  Container,
  Drawer,
  Heading,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"

/**
 * Sections éditoriales de la fiche produit (accordéons du storefront).
 * Chaque section est stockée dans `product.metadata[key]`.
 */
const SECTIONS = [
  { key: "details_matiere", label: "Détails & matière" },
  { key: "utilisation", label: "Utilisation" },
  { key: "livraison_retours", label: "Livraison & retours" },
] as const

type SectionKey = (typeof SECTIONS)[number]["key"]
type FormState = Record<SectionKey, string>

/** Lit une valeur metadata en chaîne (vide si absente ou non-textuelle). */
const readString = (
  metadata: Record<string, unknown> | null | undefined,
  key: string
): string => {
  const value = metadata?.[key]
  return typeof value === "string" ? value : ""
}

const toFormState = (
  metadata: Record<string, unknown> | null | undefined
): FormState =>
  SECTIONS.reduce((acc, { key }) => {
    acc[key] = readString(metadata, key)
    return acc
  }, {} as FormState)

const ProductEditorialWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(() => toFormState(product.metadata))

  const updateProduct = useMutation({
    mutationFn: (values: FormState) =>
      sdk.admin.product.update(product.id, {
        metadata: { ...(product.metadata ?? {}), ...values },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Contenu éditorial enregistré")
      setOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de l'enregistrement")
    },
  })

  const openDrawer = () => {
    setForm(toFormState(product.metadata))
    setOpen(true)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Contenu éditorial</Heading>
        <Button size="small" variant="secondary" onClick={openDrawer}>
          <PencilSquare />
          Modifier
        </Button>
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        {SECTIONS.map(({ key, label }) => {
          const value = readString(product.metadata, key)
          return (
            <div key={key} className="flex flex-col gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                {label}
              </Text>
              <Text
                size="small"
                leading="compact"
                className="whitespace-pre-line text-ui-fg-subtle"
              >
                {value.trim() || "Non renseigné"}
              </Text>
            </div>
          )
        })}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Contenu éditorial</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-auto">
            <div className="flex flex-col gap-y-4">
              {SECTIONS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-y-2">
                  <Label size="small" weight="plus">
                    {label}
                  </Label>
                  <Textarea
                    rows={4}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={updateProduct.isPending}
                >
                  Annuler
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                isLoading={updateProduct.isPending}
                onClick={() => updateProduct.mutate(form)}
              >
                Enregistrer
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductEditorialWidget
