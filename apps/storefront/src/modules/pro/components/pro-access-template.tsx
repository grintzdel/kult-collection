"use client"

import { login } from "@lib/data/customer"
import { Button, Input, Label, Text } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import ProLeadForm from "./pro-lead-form"

type Tab = "login" | "request"

const TAB_CLASS =
  "flex-1 border-b-2 pb-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors"

const ProAccessTemplate = () => {
  const [tab, setTab] = useState<Tab>("login")

  return (
    <section className="bg-[#fdf6ee] py-24">
      <div className="mx-auto w-full max-w-lg px-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="block h-0.5 w-6 bg-green-700" />
          <span className="font-sans text-xs uppercase tracking-widest text-green-700">
            Espace Pro
          </span>
        </div>
        <h1 className="mb-10 font-serif text-5xl leading-tight text-ink">
          {tab === "login" ? (
            <>
              Bon retour
              <br />
              parmi nous.
            </>
          ) : (
            <>
              Rejoignez
              <br />
              l'espace pro.
            </>
          )}
        </h1>

        {/* Onglets */}
        <div className="mb-10 flex">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`${TAB_CLASS} ${
              tab === "login"
                ? "border-green-700 text-ink"
                : "border-ink/10 text-ink/40 hover:text-ink/70"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setTab("request")}
            className={`${TAB_CLASS} ${
              tab === "request"
                ? "border-green-700 text-ink"
                : "border-ink/10 text-ink/40 hover:text-ink/70"
            }`}
          >
            Demande d'accès
          </button>
        </div>

        {tab === "login" ? <ProLoginForm /> : <ProLeadForm />}
      </div>
    </section>
  )
}

const ProLoginForm = () => {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "fr"
  const [message, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (message?.state === "success") {
      router.push(`/${countryCode}/pro`)
      router.refresh()
    }
  }, [message, router, countryCode])

  return (
    <form action={formAction} className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-1.5">
        <Label htmlFor="pro-email">Email professionnel *</Label>
        <Input
          id="pro-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-y-1.5">
        <Label htmlFor="pro-password">Mot de passe *</Label>
        <Input
          id="pro-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      {message?.state === "verification_required" && (
        <Text className="text-sm text-neutral-600" role="status">
          Un lien de vérification a été envoyé à <strong>{message.email}</strong>
          . Vérifiez votre email, puis connectez-vous.
        </Text>
      )}

      {message?.state === "error" && (
        <Text className="text-sm text-red-600" role="alert">
          {message.error}
        </Text>
      )}

      <Button
        type="submit"
        variant="primary"
        className="mt-2 h-10 w-full"
        isLoading={isPending}
        disabled={isPending}
      >
        Se connecter
      </Button>

      <Text className="mt-2 text-center text-sm text-neutral-500">
        Pas encore de compte pro ? Faites une demande d'accès ci-dessus.
      </Text>
    </form>
  )
}

export default ProAccessTemplate
