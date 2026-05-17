import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateMetadata } from "../lib/generateMetadata";
import { readJsonFile } from "../lib/readJson";
import { validateTraitConfig } from "../lib/validateTraitConfig";
import type { TraitConfig } from "../types";

const args = parseArgs(process.argv.slice(2));
const input = args.input ?? "examples/traits.json";
const outDir = args.out ?? "out/metadata";
const count = Number(args.count ?? "10");

if (!Number.isInteger(count) || count < 1) {
  throw new Error("--count must be a positive integer");
}

const config = await readJsonFile<TraitConfig>(input);
const configErrors = validateTraitConfig(config);
if (configErrors.length > 0) {
  throw new Error(`Invalid trait config:\n${configErrors.map((error) => `- ${error}`).join("\n")}`);
}

await mkdir(outDir, { recursive: true });
const manifest = [];

for (let tokenId = 1; tokenId <= count; tokenId += 1) {
  const metadata = generateMetadata(config, tokenId);
  const filePath = join(outDir, `${tokenId}.json`);
  await writeFile(filePath, `${JSON.stringify(metadata, null, 2)}\n`);
  manifest.push({ tokenId, file: `${tokenId}.json`, dna: metadata.dna });
}

await writeFile(join(outDir, "manifest.json"), `${JSON.stringify({ count, items: manifest }, null, 2)}\n`);
console.log(`Generated ${count} metadata files in ${outDir}`);

function parseArgs(values: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index]?.replace(/^--/, "");
    const value = values[index + 1];
    if (key && value) parsed[key] = value;
  }
  return parsed;
}
