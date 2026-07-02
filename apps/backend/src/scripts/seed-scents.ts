import { MedusaContainer } from "@medusajs/framework";
import { applyScentWiring } from "../lib/seed/apply-scents";

/**
 * Câble les senteurs sur une base existante (idempotent) : collection
 * "Bougies parfumées" + product.metadata.senteur sur les bougies.
 * Ne recrée aucun produit.
 *
 * Usage: medusa exec ./src/scripts/seed-scents.ts
 */
export default async function seed_scents({
  container,
}: {
  container: MedusaContainer;
}) {
  await applyScentWiring(container);
}
