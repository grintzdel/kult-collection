import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Label,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../../lib/client"

type Variant = { id: string; title: string }
type Product = { id: string; title: string; variants: Variant[] }
type Tier = { min_quantity: number; discount_percent: number }

const emptyRow = (): Tier => ({ min_quantity: 1, discount_percent: 0 })

/** Nombre de produits affichés par page dans la liste. */
const PAGE_SIZE = 20

const B2BTarifsPage = () => {
  const queryClient = useQueryClient()

  const [offset, setOffset] = useState(0)
  const [product, setProduct] = useState<Product | null>(null)
  const [variant, setVariant] = useState<Variant | null>(null)
  const [currency, setCurrency] = useState("eur")
  const [rows, setRows] = useState<Tier[]>([emptyRow()])

  const { data: productsData } = useQuery<{ products: Product[]; count: number }>({
    queryKey: ["pro-tier-products", offset],
    queryFn: () =>
      sdk.admin.product.list({
        limit: PAGE_SIZE,
        offset,
        fields: "id,title,variants.id,variants.title",
      }) as unknown as Promise<{ products: Product[]; count: number }>,
  })

  const products = productsData?.products ?? []
  const count = productsData?.count ?? 0
  const canPrev = offset > 0
  const canNext = offset + PAGE_SIZE < count

  const { data: tiersData } = useQuery<{ tiers: Tier[] }>({
    queryKey: ["pro-tiers", variant?.id],
    queryFn: () =>
      sdk.client.fetch(`/admin/pro/price-tiers?variant_id=${variant!.id}`),
    enabled: !!variant,
  })

  useEffect(() => {
    if (tiersData) {
      setRows(
        tiersData.tiers.length
          ? tiersData.tiers.map((t) => ({
              min_quantity: t.min_quantity,
              discount_percent: t.discount_percent,
            }))
          : [emptyRow()]
      )
    }
  }, [tiersData])

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/pro/price-tiers", {
        method: "POST",
        body: {
          variant_id: variant!.id,
          currency_code: currency.trim().toLowerCase() || "eur",
          tiers: rows
            .filter(
              (r) =>
                r.min_quantity >= 1 &&
                r.discount_percent >= 0 &&
                r.discount_percent <= 100
            )
            .map((r) => ({
              min_quantity: Number(r.min_quantity),
              discount_percent: Number(r.discount_percent),
            })),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro-tiers", variant?.id] })
      toast.success("Paliers de prix pro enregistrés")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de l'enregistrement")
    },
  })

  const updateRow = (index: number, patch: Partial<Tier>) =>
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Tarifs pro (paliers de quantité)</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Réduction en % sur le prix de base, dégressive selon la quantité.
          Appliquée automatiquement aux clients du groupe « Pros » via la price
          list « Tarif Pro ». Le prix barré s'affiche sur la fiche produit.
        </Text>
      </div>

      {/* 1. Liste des produits (paginée) */}
      <div className="flex flex-col gap-y-2 px-6 py-4">
        <Label size="small" weight="plus">
          Produits
        </Label>
        <div className="flex flex-col gap-y-1 pt-1">
          {products.length ? (
            products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProduct(p)
                  setVariant(null)
                }}
                className={`rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-ui-bg-base-hover ${
                  product?.id === p.id ? "bg-ui-bg-base-pressed" : ""
                }`}
              >
                {p.title}
              </button>
            ))
          ) : (
            <Text size="small" className="text-ui-fg-subtle">
              Aucun produit.
            </Text>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Text size="small" className="text-ui-fg-subtle">
            {count === 0
              ? "0 produit"
              : `${offset + 1}–${Math.min(offset + PAGE_SIZE, count)} sur ${count}`}
          </Text>
          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              variant="secondary"
              disabled={!canPrev}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              Précédent
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={!canNext}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Sélection variante */}
      {product && (
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Label size="small" weight="plus">
            Variante de « {product.title} »
          </Label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <Button
                key={v.id}
                size="small"
                variant={variant?.id === v.id ? "primary" : "secondary"}
                onClick={() => setVariant(v)}
              >
                {v.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Éditeur de paliers */}
      {variant && (
        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div className="flex items-center justify-between">
            <Label size="small" weight="plus">
              Paliers pour « {variant.title} »
            </Label>
            <div className="flex items-center gap-x-2">
              <Text size="small" className="text-ui-fg-subtle">
                Devise
              </Text>
              <Input
                className="w-20"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Quantité min.</Table.HeaderCell>
                <Table.HeaderCell>Réduction (%)</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Input
                      type="number"
                      min={1}
                      value={row.min_quantity}
                      onChange={(e) =>
                        updateRow(index, {
                          min_quantity: e.target.valueAsNumber || 1,
                        })
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      value={row.discount_percent}
                      onChange={(e) =>
                        updateRow(index, {
                          discount_percent: e.target.valueAsNumber || 0,
                        })
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <IconButton
                      size="small"
                      variant="transparent"
                      disabled={rows.length <= 1}
                      onClick={() =>
                        setRows((rs) => rs.filter((_, i) => i !== index))
                      }
                    >
                      ✕
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <div className="flex items-center justify-between">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setRows((rs) => [...rs, emptyRow()])}
            >
              + Ajouter un palier
            </Button>
            <Button
              size="small"
              onClick={() => save.mutate()}
              isLoading={save.isPending}
            >
              Enregistrer les paliers
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Tarifs pro",
  icon: CurrencyDollar,
})

export default B2BTarifsPage
