import type { TraitConfig } from "../types";

export function validateTraitConfig(config: TraitConfig): string[] {
  const errors: string[] = [];

  if (!config.collectionName?.trim()) errors.push("collectionName is required");
  if (!config.description?.trim()) errors.push("description is required");
  if (!config.imageBaseUri?.trim()) errors.push("imageBaseUri is required");
  if (!Array.isArray(config.layers) || config.layers.length === 0) errors.push("at least one trait layer is required");

  for (const [index, layer] of config.layers.entries()) {
    if (!layer.trait_type?.trim()) errors.push(`layers[${index}].trait_type is required`);
    if (!Array.isArray(layer.values) || layer.values.length === 0) errors.push(`layers[${index}].values must not be empty`);
  }

  return errors;
}
