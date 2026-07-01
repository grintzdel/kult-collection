"use client"

import { submitProLead } from "@lib/data/pro-actions"
import { Button, Input, Label, Text } from "@modules/common/components/ui"
import { useState } from "react"

const ProLeadForm = () => {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const result = await submitProLead({
      company: String(formData.get("company") || ""),
      email: String(formData.get("email") || ""),
      vat_or_siret: String(formData.get("vat_or_siret") || "") || undefined,
      message: String(formData.get("message") || "") || undefined,
    })

    setPending(false)

    if (result.ok) {
      setDone(true)
    } else {
      setError(result.error ?? "Une erreur est survenue, réessayez.")
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <Text className="font-semibold">Demande envoyée ✓</Text>
        <Text className="mt-1 text-neutral-600">
          Merci — notre équipe revient vers vous rapidement pour ouvrir votre
          accès pro.
        </Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-1.5">
        <Label htmlFor="company">
          Société *
        </Label>
        <Input id="company" name="company" required autoComplete="organization" />
      </div>

      <div className="flex flex-col gap-y-1.5">
        <Label htmlFor="email">
          Email professionnel *
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="flex flex-col gap-y-1.5">
        <Label htmlFor="vat_or_siret">
          N° TVA / SIRET
        </Label>
        <Input id="vat_or_siret" name="vat_or_siret" />
      </div>

      <div className="flex flex-col gap-y-1.5">
        <Label htmlFor="message">
          Votre projet
        </Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="txt-compact-small rounded-md border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-neutral-900"
        />
      </div>

      {error && (
        <Text className="text-sm text-red-600" role="alert">
          {error}
        </Text>
      )}

      <Button
        type="submit"
        variant="primary"
        className="h-10 w-full"
        isLoading={pending}
        disabled={pending}
      >
        Demander un accès pro
      </Button>
    </form>
  )
}

export default ProLeadForm
