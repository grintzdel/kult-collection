import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import ScrollFX from "@modules/common/components/scroll/scroll-fx"
import KultCollection from "@modules/home/components/kult/collection"
import KultHero from "@modules/home/components/kult/hero"
import KultManifeste from "@modules/home/components/kult/manifeste"
import KultMotifs from "@modules/home/components/kult/motifs"
import KultNewsletter from "@modules/home/components/kult/newsletter"
import { toPieces } from "@modules/home/components/kult/pieces"
import KultSavoirFaire from "@modules/home/components/kult/savoir-faire"

export const metadata: Metadata = {
  title: "Une maison pleine de soleil",
  description:
    "Bougies en céramique, faites main — entre le Sud de la France et la Californie. La couleur et la matière d'abord, la vente vient après.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function Home(props: Props) {
  const { countryCode } = await props.params

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 3 },
  })

  const featured = toPieces(products)

  return (
    <>
      <ScrollFX />
      <KultHero />
      <KultManifeste />
      <KultCollection pieces={featured} />
      <KultMotifs />
      <KultSavoirFaire />
      <KultNewsletter />
    </>
  )
}
