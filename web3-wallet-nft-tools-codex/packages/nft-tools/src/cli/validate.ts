import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { readJsonFile } from "../lib/readJson";
import { validateMetadata } from "../lib/validateMetadata";

const args = parseArgs(process.argv.slice(2));
const dir = args.dir ?? "out/metadata";
const files = (await readdir(dir)).filter((file) => file.endsWith(".json") && file !== "manifest.json");

let failed = false;

for (const file of files) {
  const path = join(dir, file);
  const metadata = await readJsonFile<unknown>(path);
  const errors = validateMetadata(metadata);
  if (errors.length > 0) {
    failed = true;
    console.error(`${file}:`);
    for (const error of errors) console.error(`  - ${error}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} metadata files in ${dir}`);
}

function parseArgs(values: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index]?.replace(/^--/, "");
    const value = values[index + 1];
    if (key && value) parsed[key] = value;
  }
  return parsed;
}
