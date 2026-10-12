"use client";

import { useSyncExternalStore } from "react";
import type { LevelId } from "@/content/schema";

export type AttemptSection = "listening" | "reading" | "writing" | "mock";

export type Attempt = {
  id: string;
  level: LevelId;
  setId: string;
  section: AttemptSection;
  /** Score out of 50 for a single section, out of 150 for a mock. */
  score: number;
  outOf: number;
  raw: number;
  rawMax: number;
  date: string;
};

const KEY = "esol-trainer:attempts";
const listeners = new Set<() => void>();
const EMPTY: Attempt[] = [];
let cache: { raw: string | null; value: Attempt[] } = { raw: null, value: EMPTY };

function read(): Attempt[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    cache = { raw, value: raw ? (JSON.parse(raw) as Attempt[]) : EMPTY };
  }
  return cache.value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useAttempts(): Attempt[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function saveAttempt(attempt: Omit<Attempt, "id" | "date">) {
  const next: Attempt[] = [
    ...read(),
    { ...attempt, id: crypto.randomUUID(), date: new Date().toISOString() },
  ];
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function clearAttempts() {
  localStorage.removeItem(KEY);
  listeners.forEach((listener) => listener());
}
