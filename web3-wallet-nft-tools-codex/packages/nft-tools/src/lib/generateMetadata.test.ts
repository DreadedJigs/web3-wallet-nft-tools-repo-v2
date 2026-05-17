import assert from "node:assert/strict";
import test from "node:test";
import { generateMetadata } from "./generateMetadata";
import type { TraitConfig } from "../types";

const config: TraitConfig = {
  collectionName: "Test Collection",
  description: "Testing metadata",
  imageBaseUri: "ipfs://CID",
  layers: [
    { trait_type: "Background", values: ["Cave", "Space"] },
    { trait_type: "Eyes", values: ["Blue", "Gold"] },
  ],
};

test("generateMetadata is deterministic for a token id", () => {
  const first = generateMetadata(config, 1);
  const second = generateMetadata(config, 1);
  assert.deepEqual(first, second);
});

test("generateMetadata includes required NFT fields", () => {
  const metadata = generateMetadata(config, 7);
  assert.equal(metadata.name, "Test Collection #7");
  assert.equal(metadata.image, "ipfs://CID/7.png");
  assert.equal(metadata.attributes.length, 2);
  assert.equal(typeof metadata.dna, "string");
});
