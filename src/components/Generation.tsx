"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Job } from "@/lib/generation/jobs";
import { MicIcon } from "./icons";

type State = { job: Job | null; error?: string; checked?: boolean; target?: string };

const NEW_SET = "new";
const targetOf = (job: Job) => (job.kind === "audio" ? job.setId : NEW_SET);

const states = new Map<string, State>();
const listeners = new Set<() => void>();
const EMPTY: State = { job: null };

function setState(level: string, state: State) {
  states.set(level, state);
  listeners.forEach((listener) => listener());
}

function poll(level: string, id: string) {
  const timer = setInterval(async () => {
    const response = await fetch(`/api/generate/${id}`).catch(() => null);
    if (!response) return;
    const target = states.get(level)?.target;
    if (!response.ok) {
      clearInterval(timer);
      setState(level, { job: null, checked: true, target, error: "The server restarted while generating. Please try again." });
      return;
    }
    const job: Job = await response.json();
    setState(level, { job, checked: true, target, error: job.status === "error" ? job.error : undefined });
    if (job.status !== "running") clearInterval(timer);
  }, 2000);
}

async function resume(level: string) {
  if (states.get(level)?.checked) return;
  setState(level, { job: null, checked: true });
  const job: Job | null = await fetch(`/api/generate?level=${level}`).then((r) => r.json()).catch(() => null);
  if (job) {
    setState(level, { job, checked: true, target: targetOf(job) });
    poll(level, job.id);
  }
}

async function start(level: string, setId?: string) {
  const target = setId ?? NEW_SET;
  setState(level, { job: null, checked: true, target });
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, setId }),
  }).catch(() => null);
  const body = await response?.json().catch(() => null);
  if (!response?.ok) {
    setState(level, { job: null, checked: true, target, error: body?.error ?? "Could not reach the server." });
    return;
  }
  setState(level, { job: body, checked: true, target: targetOf(body) });
  poll(level, body.id);
}

function useGeneration(level: string): State {
  const state = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => states.get(level) ?? EMPTY,
    () => EMPTY,
  );
  const router = useRouter();
  const refreshed = useRef<string | null>(null);

  useEffect(() => {
    resume(level);
  }, [level]);

  useEffect(() => {
    if (state.job?.status === "done" && refreshed.current !== state.job.id) {
      refreshed.current = state.job.id;
      router.refresh();
    }
  }, [state.job, router]);

  return state;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
      <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

export function GenerateSetButton({ level }: { level: string }) {
  const { job, error: lastError, target } = useGeneration(level);
  const error = target === NEW_SET ? lastError : undefined;
  const running = job?.status === "running";

  if (running && job.kind === "set") {
    return (
      <div className="card space-y-3 border-indigo-200">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500" />
          <p className="font-semibold">Creating a new practice set…</p>
          <span className="ml-auto text-sm text-stone-500">{Math.round(job.progress * 100)}%</span>
        </div>
        <ProgressBar value={job.progress} />
        <p className="text-sm text-stone-500">
          {job.stage}. This takes a few minutes. You can leave this page and come back.
        </p>
      </div>
    );
  }

  return (
    <div className="card flex flex-wrap items-center gap-4 border-dashed">
      <div className="flex-1">
        <p className="font-semibold">
          {job?.status === "done" && job.kind === "set" ? "Your new practice set is ready." : "Want more practice?"}
        </p>
        <p className="text-sm text-stone-500">
          Create a brand-new set in the exam format, with recorded voices. Takes 2 to 5 minutes and costs a few cents.
        </p>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      </div>
      <button type="button" className="btn-primary" disabled={running} onClick={() => start(level)}>
        {running ? "Busy recording voices…" : error ? "Try again" : "Generate a new practice set"}
      </button>
    </div>
  );
}

export function GenerateAudioButton({ level, setId }: { level: string; setId: string }) {
  const { job, error: lastError, target } = useGeneration(level);
  const mine = target === setId;
  const error = mine ? lastError : undefined;
  const running = job?.status === "running";

  if (running && mine) {
    return (
      <div className="min-w-56 flex-1 space-y-1.5">
        <p className="text-sm font-medium text-indigo-700">{job.stage}…</p>
        <ProgressBar value={job.progress} />
      </div>
    );
  }
  if (job?.status === "done" && mine) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn-secondary" disabled={running} onClick={() => start(level, setId)}>
        <MicIcon width={16} height={16} />
        Generate natural voices
      </button>
      {error && <span className="text-sm text-rose-600">{error}</span>}
    </div>
  );
}
