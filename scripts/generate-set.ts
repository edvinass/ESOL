/**
 * Generates original practice sets with their audio. The website does the same from the level page.
 * Usage: npm run generate:set -- <level> [count]
 */
import { existsSync } from "node:fs";
import { getLevel } from "../src/content/levels";
import { getClient } from "../src/lib/ai";
import { generateAudio } from "../src/lib/generation/audio";
import { generateSet } from "../src/lib/generation/set";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  const [levelArg, countArg] = process.argv.slice(2);
  const level = getLevel(levelArg ?? "");
  if (!level) {
    console.error("Usage: npm run generate:set -- <a1|a2|b1|b2|c1|c2> [count]");
    process.exit(1);
  }
  const client = getClient();
  if (!client) {
    console.error("Set OPENAI_API_KEY in .env.local first.");
    process.exit(1);
  }

  for (let i = 0; i < Number(countArg ?? 1); i++) {
    console.log(`Writing a ${level.cefr} practice set…`);
    const set = await generateSet(client, level, (section) => console.log(`  ✓ ${section}`));
    await generateAudio(client, set, (done, total) => console.log(`  ♪ ${done}/${total} recordings`));
    console.log(`Saved ${set.id}.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
