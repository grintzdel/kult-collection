import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getProductAttributes,
  getTrustBadges,
} from "@lib/data/product-attributes"
import { getProductByHandle, listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import {
  toPiece,
  toPieces,
} from "@modules/home/components/kult/pieces"
import KultProductTemplate from "@modules/home/components/kult/product-template"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"

export async function generateStaticParams() {
  try {
    const {
      response: { products },
    } = await listProducts({
      countryCode: DEFAULT_COUNTRY,
      queryParams: { limit: 100, fields: "handle" },
    })

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions
        ?.flatMap((r) => r.countries?.map((c) => c.iso_2))
        .filter((c): c is string => Boolean(c))
    )

    if (!countryCodes?.length) {
      return []
    }

    return countryCodes.flatMap((countryCode) =>
      products
        .map((p) => p.handle)
        .filter((handle): handle is string => Boolean(handle))
        .map((handle) => ({ countryCode, handle }))
    )
  } catch {
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle, countryCode } = await props.params
  const product = await getProductByHandle(handle, countryCode)

  if (!product) {
    notFound()
  }

  const piece = toPiece(product)

  return {
    title: piece.name,
    description: piece.description.slice(0, 160),
  }
}

export default async function ProductPage(props: Props) {
  const { handle, countryCode } = await props.params

  const product = await getProductByHandle(handle, countryCode)

  if (!product) {
    notFound()
  }

  const piece = toPiece(product)

  // Pièces liées : même catégorie de préférence, sinon le reste de la collection.
  const categoryId = product.categories?.[0]?.id
  const {
    response: { products: siblings },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 6,
      ...(categoryId ? { category_id: [categoryId] } : {}),
    },
  })

  const related = toPieces(siblings)
    .filter((p) => p.handle !== piece.handle)
    .slice(0, 2)

  const [attributes, trustBadges] = await Promise.all([
    getProductAttributes(product.id),
    getTrustBadges(),
  ])

  return (
    <KultProductTemplate
      piece={piece}
      related={related}
      attributes={attributes}
      trustBadges={trustBadges}
    />
  )
}
