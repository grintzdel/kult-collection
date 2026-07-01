import { Metadata } from "next"

import KultCartTemplate from "@modules/home/components/kult/cart-template"

export const metadata: Metadata = {
  title: "Votre panier",
  description: "Votre sélection KULT.",
}

export default function CartPage() {
  return <KultCartTemplate />
}
