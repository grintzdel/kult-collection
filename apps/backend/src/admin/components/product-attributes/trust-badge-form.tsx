import { Button, Drawer, Input, Label, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"
import { TrustBadge, TRUST_BADGES_QUERY_KEY } from "./types"

type FormState = { icon: string; label: string; rank: string }

export const TrustBadgeForm = ({
  open,
  onOpenChange,
  badge,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  badge?: TrustBadge
}) => {
  const queryClient = useQueryClient()
  const isEdit = Boolean(badge)
  const [form, setForm] = useState<FormState>({ icon: "", label: "", rank: "0" })

  useEffect(() => {
    if (open) {
      setForm({
        icon: badge?.icon ?? "",
        label: badge?.label ?? "",
        rank: String(badge?.rank ?? 0),
      })
    }
  }, [open, badge])

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        icon: form.icon.trim(),
        label: form.label.trim(),
        rank: Number(form.rank) || 0,
      }
      return sdk.client.fetch(
        isEdit ? `/admin/trust-badges/${badge!.id}` : "/admin/trust-badges",
        { method: "POST", body }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUST_BADGES_QUERY_KEY })
      toast.success(isEdit ? "Badge mis à jour" : "Badge créé")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Échec de l'enregistrement")
    },
  })

  const submit = () => {
    if (!form.icon.trim() || !form.label.trim()) {
      toast.error("Icône et libellé sont obligatoires")
      return
    }
    mutation.mutate()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{isEdit ? "Modifier le badge" : "Nouveau badge"}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex-1 overflow-auto">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label size="small" weight="plus">
                Icône
              </Label>
              <Input
                value={form.icon}
                placeholder="♻"
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small" weight="plus">
                Libellé
              </Label>
              <Input
                value={form.label}
                placeholder="Contenant réutilisable"
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              />
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
