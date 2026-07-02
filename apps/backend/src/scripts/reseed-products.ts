import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import productsData from "../../data/kult/products.json";
import { buildProductOptionsAndVariants } from "../lib/seed/variant-scheme";
import { applyScentWiring } from "../lib/seed/apply-scents";
import { applyAmbianceWiring } from "../lib/seed/apply-ambiances";
import {
  querySubCategoryIdByName,
  resolveProductCategoryIds,
  seedCategoryTree,
} from "../lib/seed/categories";

// Base URL where the Medusa server exposes the local `static/` folder.
// Images live in `static/kult/*` and are referenced as `<base>/static/kult/<file>`.
const STATIC_BASE = (
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
).replace(/\/$/, "");

// Builds a clean, URL-safe handle/SKU base from a product name.
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "et")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Re-seeds ONLY products and categories from `data/kult/products.json`
 * (images served locally from `static/kult/`). Existing store infrastructure
 * (sales channels, regions, stock location, shipping profile) is reused, not
 * recreated. Safe to run repeatedly.
 *
 * Run with: `npm run reseed` (requires `npm run seed` to have run once before,
 * so that the base store infrastructure exists).
 */
export default async function reseed_products({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const take = 10000;

  logger.info("Resolving existing store infrastructure...");
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
    pagination: { take, skip: 0 },
  });
  if (!salesChannels.length) {
    throw new Error(
      "No sales channel found. Run `npm run seed` once before re-seeding products."
    );
  }
  const defaultSalesChannel =
    salesChannels.find((s) => s.name === "Default Sales Channel") ??
    salesChannels[0];

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    pagination: { take, skip: 0 },
  });
  if (!stockLocations.length) {
    throw new Error(
      "No stock location found. Run `npm run seed` once before re-seeding products."
    );
  }
  const stockLocation = stockLocations[0];

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    pagination: { take, skip: 0 },
  });
  if (!shippingProfiles.length) {
    throw new Error(
      "No shipping profile found. Run `npm run seed` once before re-seeding products."
    );
  }
  const shippingProfile = shippingProfiles[0];

  logger.info("Deleting existing products and categories...");
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
    pagination: { take, skip: 0 },
  });
  if (existingProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: existingProducts.map((p) => p.id) },
    });
  }
  logger.info(`Deleted ${existingProducts.length} products.`);

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "parent_category_id"],
    pagination: { take, skip: 0 },
  });
  if (existingCategories.length) {
    // On supprime les enfants AVANT les racines : Medusa refuse de supprimer
    // une catégorie qui a encore des sous-catégories.
    const children = existingCategories.filter((c) => c.parent_category_id);
    const roots = existingCategories.filter((c) => !c.parent_category_id);
    if (children.length) {
      await deleteProductCategoriesWorkflow(container).run({
        input: children.map((c) => c.id),
      });
    }
    if (roots.length) {
      await deleteProductCategoriesWorkflow(container).run({
        input: roots.map((c) => c.id),
      });
    }
  }
  logger.info(`Deleted ${existingCategories.length} categories.`);

  logger.info("Creating category tree...");
  const categoryIdByDataKey = await seedCategoryTree(container);
  const subCategoryIdByName = await querySubCategoryIdByName(container);

  logger.info(`Creating ${productsData.length} products...`);
  await createProductsWorkflow(container).run({
    input: {
      products: productsData.map((product) => {
        const handle = slugify(product.name);
        return {
          title: product.name,
          category_ids: resolveProductCategoryIds(
            product.name,
            product.category,
            categoryIdByDataKey,
            subCategoryIdByName
          ),
          description: product.description,
          handle,
          weight: product.weight,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: product.images.map((rel) => ({
            url: `${STATIC_BASE}/static/${rel}`,
          })),
          ...buildProductOptionsAndVariants(product, handle),
          sales_channels: [{ id: defaultSalesChannel.id }],
        };
      }),
    },
  });
  logger.info(`Created ${productsData.length} products.`);

  logger.info("Creating inventory levels for new items...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.location_id"],
    pagination: { take, skip: 0 },
  });
  const itemsWithoutLevel = inventoryItems.filter(
    (item) =>
      !(item.location_levels ?? []).some(
        (level) => level?.location_id === stockLocation.id
      )
  );
  if (itemsWithoutLevel.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: itemsWithoutLevel.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 1000000,
          inventory_item_id: item.id,
        })),
      },
    });
  }
  logger.info(
    `Created inventory levels for ${itemsWithoutLevel.length} items.`
  );

  logger.info("Wiring scents (collection + metadata.senteur)...");
  await applyScentWiring(container);

  logger.info("Wiring ambiances (tags + colors + category assignment)...");
  await applyAmbianceWiring(container);

  logger.info("Done.");
}
