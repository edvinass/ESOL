import "server-only";
import { randomUUID } from "node:crypto";
import type { LevelSpec } from "@/content/levels";
import type { PracticeSet } from "@/content/schema";
import { getClient } from "@/lib/ai";
import { generateAudio } from "./audio";
import { generateSet } from "./set";

export type Job = {
  id: string;
  level: string;
  kind: "set" | "audio";
  setId?: string;
  status: "running" | "done" | "error";
  stage: string;
  progress: number;
  error?: string;
};

const store = globalThis as typeof globalThis & { esolJobs?: Map<string, Job> };
const jobs = (store.esolJobs ??= new Map());

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function runningJob(level: string): Job | undefined {
  return [...jobs.values()].find((job) => job.level === level && job.status === "running");
}

/**
 * Starts generating in the background and returns immediately.
 * Only one job runs per level, so a second click joins the running job.
 */
export function startJob(level: LevelSpec, audioFor?: PracticeSet): Job {
  const existing = runningJob(level.id);
  if (existing) return existing;
  const client = getClient();
  if (!client) throw new Error("Add OPENAI_API_KEY to the server environment first.");

  const job: Job = {
    id: randomUUID(),
    level: level.id,
    kind: audioFor ? "audio" : "set",
    setId: audioFor?.id,
    status: "running",
    stage: audioFor ? "Recording voices" : "Writing questions and texts (0 of 3 sections)",
    progress: 0.02,
  };
  jobs.set(job.id, job);
  const update = (changes: Partial<Job>) => Object.assign(job, changes);
  const audioShare = audioFor ? 1 : 0.4;

  (async () => {
    let set = audioFor;
    if (!set) {
      let sections = 0;
      set = await generateSet(client, level, () => {
        sections++;
        update({ stage: `Writing questions and texts (${sections} of 3 sections)`, progress: 0.02 + sections * 0.19 });
      });
      update({ setId: set.id });
    }
    await generateAudio(client, set, (done, total) => {
      update({
        stage: `Recording voices (${done} of ${total} recordings)`,
        progress: 1 - audioShare + audioShare * (done / Math.max(total, 1)) * 0.98,
      });
    });
    update({ status: "done", stage: "Ready", progress: 1 });
  })().catch((error: unknown) => {
    console.error("Generation failed", error);
    update({ status: "error", error: error instanceof Error ? error.message : "Generation failed." });
  });

  return job;
}
