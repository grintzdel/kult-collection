import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"

type ProConfig = {
  active: boolean
  online_purchase_enabled: boolean
  min_order_amount: number
  currency_code: string
  display_ht: boolean
}

const PRO_CONFIG_QUERY_KEY = ["pro-config"]

const B2BConfigPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ config: ProConfig }>({
    queryKey: PRO_CONFIG_QUERY_KEY,
    queryFn: () => sdk.client.fetch("/admin/pro/config"),
  })

  const [form, setForm] = useState<ProConfig>({
    active: false,
    online_purchase_enabled: false,
    min_order_amount: 0,
    currency_code: "eur",
    display_ht: true,
  })

  useEffect(() => {
    if (data?.config) {
      setForm(data.config)
    }
  }, [data?.config])

  const updateConfig = useMutation({
    mutationFn: (payload: ProConfig) =>
      sdk.client.fetch("/admin/pro/config", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRO_CONFIG_QUERY_KEY })
      toast.success("Configuration B2B enregistrée")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de l'enregistrement")
    },
  })

  const handleSave = () => {
    updateConfig.mutate({
      ...form,
      min_order_amount: Number(form.min_order_amount) || 0,
      currency_code: form.currency_code.trim().toLowerCase() || "eur",
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Espace pro (B2B)</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Configuration de l'accès pro : visibilité, mode de vente et minimum
            de commande.
          </Text>
        </div>
        <Button
          size="small"
          onClick={handleSave}
          isLoading={updateConfig.isPending}
          disabled={isLoading || updateConfig.isPending}
        >
          Enregistrer
        </Button>
      </div>

      <div className="flex items-start justify-between px-6 py-4">
        <div className="flex flex-col gap-y-1 pr-8">
          <Text size="small" leading="compact" weight="plus">
            Espace pro actif
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Active la landing /pro et l'enrichissement du storefront pour les
            comptes du groupe « Pros ». Désactivé = boutique 100 % B2C.
          </Text>
        </div>
        <Switch
          checked={form.active}
          onCheckedChange={(active) => setForm((f) => ({ ...f, active }))}
        />
      </div>

      <div className="flex items-start justify-between px-6 py-4">
        <div className="flex flex-col gap-y-1 pr-8">
          <Text size="small" leading="compact" weight="plus">
            Achat en ligne pro
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Désactivé (défaut) = mode contact/devis : les pros voient leurs prix
            mais passent par « Demander un devis ». Activé = checkout
            self-service avec minimum de commande.
          </Text>
        </div>
        <Switch
          checked={form.online_purchase_enabled}
          onCheckedChange={(online_purchase_enabled) =>
            setForm((f) => ({ ...f, online_purchase_enabled }))
          }
        />
      </div>

      <div className="flex items-start justify-between px-6 py-4">
        <div className="flex flex-col gap-y-1 pr-8">
          <Text size="small" leading="compact" weight="plus">
            Afficher les prix HT
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Les pros raisonnent hors taxes.
          </Text>
        </div>
        <Switch
          checked={form.display_ht}
          onCheckedChange={(display_ht) =>
            setForm((f) => ({ ...f, display_ht }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-4">
        <div className="flex flex-col gap-y-2">
          <Label size="small" weight="plus">
            Minimum de commande (HT)
          </Label>
          <Input
            type="number"
            min={0}
            value={form.min_order_amount}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                min_order_amount: e.target.valueAsNumber,
              }))
            }
          />
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Appliqué au checkout seulement si l'achat en ligne est activé.
          </Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label size="small" weight="plus">
            Devise
          </Label>
          <Input
            value={form.currency_code}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency_code: e.target.value }))
            }
            placeholder="eur"
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "B2B",
  icon: BuildingStorefront,
})

export default B2BConfigPage
