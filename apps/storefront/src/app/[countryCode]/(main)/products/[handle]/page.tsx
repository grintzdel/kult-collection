import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getProductAmbiances } from "@lib/data/collection-ambiances"
import { getProductAttributes } from "@lib/data/product-attributes"
import { getProductByHandle, listProducts } from "@lib/data/products"
import { getCollectionByHandle } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import { toPiece, toPieces } from "@modules/home/components/kult/pieces"
import { pickLeafCategoryId, sameTypeSiblings } from "@modules/products/lib/siblings"
import { pickCustomPiece } from "@modules/products/lib/custom-piece"
import ProductTemplate from "@modules/products/templates/product-template"

/** Handle de la collection curée « Composez votre lot ». */
const SELECTION_COLLECTION_HANDLE = "composez-votre-lot"

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

  // Frères = « senteurs » : uniquement pour les bougies (elles portent
  // `metadata.senteur` et vivent dans la collection « bougies parfumées »). Les
  // autres produits (art de la table…) retombent sur leur SOUS-catégorie feuille
  // — important car ils peuvent appartenir à d'autres collections curées
  // (« Composez votre lot ») qui ne doivent PAS servir de groupe de senteurs.
  const isScentGroup =
    Boolean(product.metadata?.senteur) && Boolean(product.collection_id)
  const categoryId = pickLeafCategoryId(product.categories)
  const scentFilter = isScentGroup
    ? { collection_id: [product.collection_id as string] }
    : categoryId
      ? { category_id: [categoryId] }
      : {}

  // Pas de limite en dur : on lit d'abord le total du groupe, puis on récupère
  // tous les frères (limite = total réel).
  const {
    response: { count: siblingsCount },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 1, fields: "id", ...scentFilter },
  })

  const [{ response: siblingsResponse }, attributes, ambiances] =
    await Promise.all([
      listProducts({
        countryCode,
        queryParams: { limit: Math.max(siblingsCount, 1), ...scentFilter },
      }),
      getProductAttributes(product.id),
      getProductAmbiances([product.id]),
    ])

  // Bougies : la collection groupe déjà par senteur, on garde tous les frères.
  // Sinon (vaisselle…) : on ne garde que les autres produits du MÊME TYPE, pour
  // matcher le « N autres modèles » de la carte (une assiette → les assiettes).
  const siblings = isScentGroup
    ? siblingsResponse.products.filter((p) => p.handle !== product.handle)
    : sameTypeSiblings(product, siblingsResponse.products)

  // Sélection curée « Composez votre lot » (même sur chaque page produit).
  const selectionCollection = await getCollectionByHandle(
    SELECTION_COLLECTION_HANDLE
  )
  let lotPieces = [] as ReturnType<typeof toPieces>
  if (selectionCollection?.id) {
    const {
      response: { products: lotProducts },
    } = await listProducts({
      countryCode,
      queryParams: { collection_id: [selectionCollection.id], limit: 8 },
    })
    lotPieces = toPieces(lotProducts.filter((p) => p.id !== product.id))
  }

  // Section « pièce personnalisée » : contenu de la catégorie (sinon masquée).
  const customPiece = pickCustomPiece(product)

  return (
    <ProductTemplate
      product={product}
      siblings={siblings}
      attributes={attributes}
      ambiance={ambiances[product.id] ?? null}
      lotPieces={lotPieces}
      customPiece={customPiece}
    />
  )
}
