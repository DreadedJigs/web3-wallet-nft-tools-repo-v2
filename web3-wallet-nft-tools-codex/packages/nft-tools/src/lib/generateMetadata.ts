import { createHash } from "node:crypto";
import type { GeneratedMetadata, TraitConfig } from "../types";

export function generateMetadata(config: TraitConfig, tokenId: number): GeneratedMetadata {
  const attributes = config.layers.map((layer, layerIndex) => {
    const valueIndex = deterministicIndex(`${tokenId}:${layer.trait_type}:${layerIndex}`, layer.values.length);
    const selectedValue = layer.values[valueIndex];

    if (selectedValue === undefined) {
      throw new Error(`No trait value found for layer ${layer.trait_type}`);
    }

    return {
      trait_type: layer.trait_type,
      value: selectedValue,
    };
  });

  const dna = createHash("sha256").update(JSON.stringify(attributes)).digest("hex");
  const imageBase = config.imageBaseUri.replace(/\/$/, "");
  const externalBase = config.externalUrlBase?.replace(/\/$/, "");

  return {
    name: `${config.collectionName} #${tokenId}`,
    description: config.description,
    image: `${imageBase}/${tokenId}.png`,
    ...(externalBase ? { external_url: `${externalBase}/${tokenId}` } : {}),
    attributes,
    dna,
  };
}

function deterministicIndex(seed: string, modulo: number): number {
  if (modulo <= 0) throw new Error("Cannot choose from an empty trait list");
  const hash = createHash("sha256").update(seed).digest("hex");
  return Number.parseInt(hash.slice(0, 8), 16) % modulo;
}
