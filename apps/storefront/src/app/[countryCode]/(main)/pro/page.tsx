import { getProContext } from "@lib/data/pro"
import ProLeadForm from "@modules/pro/components/pro-lead-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Espace Pro — KULT",
  description:
    "Revendeurs, boutiques, hôtels & spas : accédez aux tarifs de gros KULT sur nos bougies et parfums.",
}

const ARGUMENTS = [
  {
    title: "Tarifs de gros HT",
    body: "Des prix revendeur pensés pour préserver votre marge, affichés hors taxes.",
  },
  {
    title: "Paliers de volume",
    body: "Plus vous commandez, plus la remise augmente — automatiquement.",
  },
  {
    title: "Un catalogue, zéro friction",
    body: "Les mêmes bougies et parfums KULT, aux conditions pro une fois votre compte activé.",
  },
]

export default async function ProLandingPage() {
  const { config } = await getProContext()
  const currency = (config.currency_code || "eur").toUpperCase()

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Espace professionnel
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Vendez KULT dans votre boutique
        </h1>
        <p className="mt-4 text-neutral-600">
          Revendeurs déco, concept-stores, hôtels et spas : rejoignez notre
          réseau de partenaires et proposez nos bougies et parfums à vos clients,
          aux conditions de gros.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {ARGUMENTS.map((arg) => (
          <div
            key={arg.title}
            className="rounded-lg border border-neutral-200 p-5"
          >
            <h3 className="font-semibold">{arg.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-600">{arg.body}</p>
          </div>
        ))}
      </div>

      {config.min_order_amount > 0 && (
        <p className="mt-8 text-sm text-neutral-600">
          Minimum de commande :{" "}
          <span className="font-semibold text-neutral-900">
            {config.min_order_amount} {currency} HT
          </span>
          .
        </p>
      )}

      <div className="mt-14 grid gap-10 border-t border-neutral-200 pt-14 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Demander un accès pro
          </h2>
          <p className="mt-3 text-neutral-600">
            Renseignez votre société — nous revenons vers vous pour ouvrir votre
            compte et vous communiquer nos tarifs. Les comptes pro sont validés
            manuellement par notre équipe.
          </p>
        </div>
        <ProLeadForm />
      </div>
    </div>
  )
}
