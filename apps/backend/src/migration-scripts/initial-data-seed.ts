import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createProductTagsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows";
import productsData from "../../data/kult/products.json";
import { setProductAmbianceWorkflow } from "../workflows/ambiance/set-product-ambiance";

// Base URL where the Medusa server exposes the local `static/` folder.
// Images live in `static/kult/*` and are referenced as `<base>/static/kult/<file>`.
const STATIC_BASE = (
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
).replace(/\/$/, "");

// Builds a clean, URL-safe handle/SKU base from a product name.
// Strips accents, replaces "&" with "et" and apostrophes/spaces with dashes.
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "et")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  // Categories mirror the live kultcollection.com store menu.
  const categoryDefs = [
    {
      name: "Bougies",
      description:
        "Bougies parfumées artisanales en cire de soja 100 % naturelle, fabriquées à la main dans le sud de la France.",
    },
    {
      name: "Bougies Gold",
      description:
        "Bougies en céramique émaillée coulées à la main, cire de soja 100 % naturelle et parfums de Grasse.",
    },
    {
      name: "Parfums",
      description:
        "Diffuseurs et parfums de maison sans alcool, 100 % biodégradables, parfums de Grasse.",
    },
    {
      name: "Céramiques",
      description:
        "Vaisselle et objets en faïence peints à la main, collection Riviera : tasses, assiettes, pichets, bougeoirs.",
    },
  ];

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: categoryDefs.map((c) => ({
        name: c.name,
        description: c.description,
        is_active: true,
      })),
    },
  });

  const categoryIdByName = new Map(
    categoryResult.map((cat) => [cat.name, cat.id])
  );

  logger.info("Seeding ambiances (product tags).");
  const ambianceValues = ["california", "palm beach", "cozy", "méditerranée"];
  const { result: ambianceTags } = await createProductTagsWorkflow(container).run({
    input: { product_tags: ambianceValues.map((value) => ({ value })) },
  });
  const tagIdByValue = new Map(
    (ambianceTags as { id: string; value: string }[]).map((t) => [t.value, t.id])
  );

  const categoryAmbiance: Record<string, string> = {
    Bougies: "cozy",
    "Bougies Gold": "california",
    Parfums: "méditerranée",
    Céramiques: "palm beach",
  };
  for (const [categoryName, ambianceValue] of Object.entries(categoryAmbiance)) {
    const categoryId = categoryIdByName.get(categoryName);
    const tagId = tagIdByValue.get(ambianceValue);
    if (categoryId && tagId) {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: categoryId },
          update: { metadata: { ambiance_tag_id: tagId } },
        },
      });
    }
  }

  await createProductsWorkflow(container).run({
    input: {
      products: productsData.map((product) => {
        const handle = slugify(product.name);
        return {
          title: product.name,
          category_ids: [categoryIdByName.get(product.category)!],
          description: product.description,
          handle,
          weight: product.weight,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: product.images.map((rel) => ({
            url: `${STATIC_BASE}/static/${rel}`,
          })),
          options: [
            {
              title: "Format",
              values: [product.format],
            },
          ],
          variants: [
            {
              title: product.name,
              sku: handle.toUpperCase(),
              manage_inventory: true,
              options: {
                Format: product.format,
              },
              prices: [
                {
                  amount: product.price,
                  currency_code: product.currency.toLowerCase(),
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        };
      }),
    },
  });
  logger.info(`Finished seeding ${productsData.length} products.`);

  // Démo : surcharge d'une bougie avec une ambiance différente de sa catégorie.
  const demoProduct = productsData.find((p) => p.category === "Bougies");
  const californiaId = tagIdByValue.get("california");
  if (demoProduct && californiaId) {
    const { data: demoRows } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { handle: slugify(demoProduct.name) },
    });
    const demoId = (demoRows[0] as { id: string } | undefined)?.id;
    if (demoId) {
      await setProductAmbianceWorkflow(container).run({
        input: { product_id: demoId, tag_id: californiaId },
      });
    }
  }

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
