/**
 * Records listening audio for existing sets. The website does the same from the level page.
 * Usage: npm run generate:audio -- <level> [setId] [--force]
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getLevel } from "../src/content/levels";
import { practiceSetSchema } from "../src/content/schema";
import { getClient } from "../src/lib/ai";
import { generateAudio } from "../src/lib/generation/audio";
import { setFiles } from "../src/lib/storage";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const [levelArg, setArg] = args.filter((arg) => !arg.startsWith("--"));
  const level = getLevel(levelArg ?? "");
  if (!level) {
    console.error("Usage: npm run generate:audio -- <level> [setId] [--force]");
    process.exit(1);
  }
  const client = getClient();
  if (!client) {
    console.error("Set OPENAI_API_KEY in .env.local first.");
    process.exit(1);
  }

  for (const file of setFiles(level.id).filter((file) => !setArg || path.basename(file, ".json") === setArg)) {
    const set = practiceSetSchema.parse(JSON.parse(readFileSync(file, "utf8")));
    await generateAudio(client, set, (done, total) => console.log(`${set.id}: ${done}/${total} recordings`), force);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
