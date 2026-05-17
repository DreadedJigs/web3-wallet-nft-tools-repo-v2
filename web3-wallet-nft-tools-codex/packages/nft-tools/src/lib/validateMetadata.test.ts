import assert from "node:assert/strict";
import test from "node:test";
import { validateMetadata } from "./validateMetadata";

test("validateMetadata accepts a basic metadata object", () => {
  const errors = validateMetadata({
    name: "Token #1",
    description: "A token",
    image: "ipfs://CID/1.png",
    attributes: [{ trait_type: "Fur", value: "Black" }],
  });
  assert.deepEqual(errors, []);
});

test("validateMetadata rejects missing image", () => {
  const errors = validateMetadata({
    name: "Token #1",
    description: "A token",
    attributes: [],
  });
  assert.ok(errors.includes("image is required"));
});
