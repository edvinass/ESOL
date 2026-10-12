import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/** Sets that ship with the code. Read-only at runtime. */
export const BUILTIN_SETS_DIR = path.join(process.cwd(), "content", "sets");

/** Generated sets and audio. Point DATA_DIR at a persistent volume in production. */
export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));

export function generatedSetsDir(level: string): string {
  return path.join(DATA_DIR, "sets", level);
}

export function audioDir(level: string, setId: string): string {
  return path.join(DATA_DIR, "audio", level, setId);
}

export function setFiles(level: string): string[] {
  return [path.join(BUILTIN_SETS_DIR, level), generatedSetsDir(level)].flatMap((dir) =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((file) => file.endsWith(".json"))
          .map((file) => path.join(dir, file))
      : [],
  );
}

export function setNumber(setId: string): number {
  return Number(setId.split("-").pop()) || 0;
}

export function recordedAudioIds(level: string, setId: string): string[] {
  const dir = audioDir(level, setId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mp3"))
    .map((file) => file.replace(/\.mp3$/, ""));
}
