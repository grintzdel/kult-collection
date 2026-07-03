import { Metadata } from "next"
import ProAccessTemplate from "@modules/pro/components/pro-access-template"

export const metadata: Metadata = {
  title: "Espace Pro — Connexion — KULT",
  description:
    "Connectez-vous à votre espace professionnel KULT ou faites une demande d'accès pro.",
}

export default function ProAccessPage() {
  return <ProAccessTemplate />
}
