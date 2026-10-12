import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LEVEL_IDS, practiceSetSchema, type LevelId, type PracticeSet } from "@/content/schema";
import { recordedAudioIds, setFiles, setNumber } from "./storage";

export function listSets(level: LevelId): PracticeSet[] {
  return setFiles(level)
    .map((file) => {
      const parsed = practiceSetSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
      if (!parsed.success) {
        throw new Error(`Invalid practice set ${path.basename(file)}: ${parsed.error.message}`);
      }
      return parsed.data;
    })
    .sort((a, b) => setNumber(a.id) - setNumber(b.id));
}

export function getSet(level: LevelId, setId: string): PracticeSet | undefined {
  return listSets(level).find((set) => set.id === setId);
}

export function allSetParams(): { level: LevelId; setId: string }[] {
  return LEVEL_IDS.flatMap((level) => listSets(level).map((set) => ({ level, setId: set.id })));
}

export function listeningAudioIds(set: PracticeSet): string[] {
  return set.listening.flatMap((part) => part.groups.flatMap((group) => (group.audio ? [group.audio.id] : [])));
}

/** True when every listening recording in the set has been generated. */
export function hasAllAudio(set: PracticeSet): boolean {
  const recorded = new Set(recordedAudioIds(set.level, set.id));
  return listeningAudioIds(set).every((id) => recorded.has(id));
}
