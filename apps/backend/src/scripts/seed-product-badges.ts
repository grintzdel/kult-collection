import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { upsertProductBadgeWorkflow } from "../workflows/product-attribute/manage-product-badges"

const FEATURED_COUNT = 7
const NEW_COUNT = 4

const BADGES = [
  { type: "featured" as const, label: "Produit phare", file: "phares.png" },
  { type: "new" as const, label: "Nouveau produit", file: "new.png" },
]

/** Résout le chemin d'une image `medias/<file>` depuis le cwd du backend. */
function resolveMediaPath(file: string): string {
  const candidates = [
    resolve(process.cwd(), "../../medias", file),
    resolve(process.cwd(), "../../../medias", file),
    resolve(process.cwd(), "medias", file),
  ]
  const found = candidates.find((p) => existsSync(p))
  if (!found) {
    throw new Error(
      `Image introuvable pour « ${file} ». Cherché: ${candidates.join(", ")}`
    )
  }
  return found
}

/**
 * Seed des badges d'indication produit :
 * 1. upload des images `phares.png` / `new.png` (File Module, public) ;
 * 2. upsert des deux badges globaux avec leur URL d'image ;
 * 3. marque 7 produits comme « phare » et 4 comme « nouveau »
 *    (via `product.metadata.is_featured` / `is_new`, fusionné).
 *
 * Rejouable. Run: `npm run seed:badges`.
 */
export default async function seedProductBadges({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // 1 + 2. Upload des images puis upsert des badges.
  for (const badge of BADGES) {
    const path = resolveMediaPath(badge.file)
    const content = readFileSync(path).toString("base64")

    const { result: files } = await uploadFilesWorkflow(container).run({
      input: {
        files: [
          {
            filename: badge.file,
            mimeType: "image/png",
            content,
            access: "public",
          },
        ],
      },
    })

    const image_url = files[0]?.url ?? null

    await upsertProductBadgeWorkflow(container).run({
      input: { type: badge.type, label: badge.label, image_url },
    })
    logger.info(`Badge « ${badge.label} » configuré (${image_url}).`)
  }

  // 3. Marque des produits (déterministe : par ordre de création).
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "metadata", "created_at"],
    pagination: { take: 10000, skip: 0 },
  })

  if (products.length < FEATURED_COUNT + NEW_COUNT) {
    logger.warn(
      `Seulement ${products.length} produits ; certains badges ne seront pas assignés. Lancez d'abord \`npm run reseed\`.`
    )
  }

  const sorted = [...products].sort((a, b) =>
    String(a.created_at).localeCompare(String(b.created_at))
  )
  const featuredIds = new Set(sorted.slice(0, FEATURED_COUNT).map((p) => p.id))
  const newIds = new Set(
    sorted.slice(FEATURED_COUNT, FEATURED_COUNT + NEW_COUNT).map((p) => p.id)
  )

  // Réassignation déterministe : on repart d'un état propre (on retire les
  // anciens flags de TOUS les produits) puis on pose exactement les nouveaux.
  let updated = 0
  for (const p of products) {
    const current = (p.metadata ?? {}) as Record<string, unknown>
    const hadFeatured = current.is_featured === true
    const hadNew = current.is_new === true
    const wantFeatured = featuredIds.has(p.id)
    const wantNew = newIds.has(p.id)

    if (hadFeatured === wantFeatured && hadNew === wantNew) {
      continue
    }

    const metadata = { ...current }
    delete metadata.is_featured
    delete metadata.is_new
    if (wantFeatured) {
      metadata.is_featured = true
    }
    if (wantNew) {
      metadata.is_new = true
    }

    await updateProductsWorkflow(container).run({
      input: { selector: { id: p.id }, update: { metadata } },
    })
    updated++
  }

  logger.info(
    `Assigné : ${featuredIds.size} produits phares, ${newIds.size} nouveaux produits (${updated} produits mis à jour).`
  )
  logger.info("Done.")
}
