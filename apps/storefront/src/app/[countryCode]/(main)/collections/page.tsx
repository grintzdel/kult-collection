import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import KultCollectionGrid from "@modules/home/components/kult/collection-grid"
import KultCollectionHero from "@modules/home/components/kult/collection-hero"
import KultCommentChoisir from "@modules/home/components/kult/comment-choisir"
import KultNewsletter from "@modules/home/components/kult/newsletter"
import { toPieces } from "@modules/home/components/kult/pieces"

export const metadata: Metadata = {
  title: "La collection",
  description:
    "Des bougies et parfums coulés une à une — une couleur, une matière, un parfum de Grasse.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function CollectionsPage(props: Props) {
  const { countryCode } = await props.params

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })

  const pieces = toPieces(products)

  return (
    <>
      <KultCollectionHero />
      <KultCollectionGrid pieces={pieces} />
      <KultCommentChoisir />
      <KultNewsletter title="Les nouvelles pièces, avant tout le monde." />
    </>
  )
}
