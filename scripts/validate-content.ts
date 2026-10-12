import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { getLevel } from "../src/content/levels";
import { LEVEL_IDS, practiceSetSchema } from "../src/content/schema";
import { validateAgainstSpec } from "../src/content/validate";

const root = path.join(process.cwd(), "content", "sets");
let failures = 0;
let checked = 0;

for (const level of LEVEL_IDS) {
  const dir = path.join(root, level);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
    checked++;
    const label = `${level}/${file}`;
    const parsed = practiceSetSchema.safeParse(JSON.parse(readFileSync(path.join(dir, file), "utf8")));
    if (!parsed.success) {
      failures++;
      console.error(`✗ ${label}\n${parsed.error.message}`);
      continue;
    }
    const errors = validateAgainstSpec(parsed.data, getLevel(level)!);
    if (errors.length > 0) {
      failures++;
      console.error(`✗ ${label}\n  ${errors.join("\n  ")}`);
    } else {
      console.log(`✓ ${label}`);
    }
  }
}

console.log(`${checked} set(s) checked, ${failures} with problems.`);
process.exit(failures > 0 ? 1 : 0);
