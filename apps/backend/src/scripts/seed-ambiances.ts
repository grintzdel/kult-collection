import { MedusaContainer } from "@medusajs/framework";
import { applyAmbianceWiring } from "../lib/seed/apply-ambiances";

/**
 * Câble les ambiances sur une base existante (idempotent) : tags + couleurs,
 * assignation aux catégories feuilles, surcharge démo. Ne recrée aucun produit.
 *
 * Usage: medusa exec ./src/scripts/seed-ambiances.ts
 */
export default async function seed_ambiances({
  container,
}: {
  container: MedusaContainer;
}) {
  await applyAmbianceWiring(container);
}
