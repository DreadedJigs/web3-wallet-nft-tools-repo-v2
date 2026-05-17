import type { NftMetadata } from "../types";

export function validateMetadata(metadata: unknown): string[] {
  const errors: string[] = [];
  const value = metadata as Partial<NftMetadata>;

  if (!value || typeof value !== "object") return ["metadata must be an object"];
  if (typeof value.name !== "string" || value.name.trim() === "") errors.push("name is required");
  if (typeof value.description !== "string" || value.description.trim() === "") errors.push("description is required");
  if (typeof value.image !== "string" || value.image.trim() === "") errors.push("image is required");
  if (!Array.isArray(value.attributes)) errors.push("attributes must be an array");

  if (Array.isArray(value.attributes)) {
    value.attributes.forEach((attribute, index) => {
      if (!attribute || typeof attribute !== "object") {
        errors.push(`attributes[${index}] must be an object`);
        return;
      }
      if (typeof attribute.trait_type !== "string" || attribute.trait_type.trim() === "") {
        errors.push(`attributes[${index}].trait_type is required`);
      }
      if (!["string", "number"].includes(typeof attribute.value)) {
        errors.push(`attributes[${index}].value must be a string or number`);
      }
    });
  }

  return errors;
}
