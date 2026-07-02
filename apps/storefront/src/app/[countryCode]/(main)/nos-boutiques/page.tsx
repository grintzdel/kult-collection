import { Metadata } from "next"

import BoutiquesTemplate from "@modules/boutiques/templates/boutiques-template"

export const metadata: Metadata = {
  title: "Nos boutiques",
  description:
    "Retrouvez KULT market à Paris 20e et à Vincennes — adresses, horaires et plan d'accès.",
}

export default function BoutiquesPage() {
  return <BoutiquesTemplate />
}
