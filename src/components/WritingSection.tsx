"use client";

import { useEffect, useState } from "react";
import type { LevelSpec } from "@/content/levels";
import type { WritingTask } from "@/content/schema";
import { saveAttempt } from "@/lib/progress";
import { countWords, scaleToSection } from "@/lib/scoring";
import type { WritingFeedback } from "@/lib/writing-feedback";
import { WritingFeedbackView } from "./WritingFeedbackView";

type Props = {
  level: LevelSpec;
  setId: string;
  tasks: WritingTask[];
  /** In a mock, reports the raw writing score (null when AI marking is unavailable). */
  onFinish?: (raw: number | null, max: number) => void;
};

type TaskState = { feedback?: WritingFeedback; error?: string; loading?: boolean };

const draftKey = (scope: "practice" | "mock", level: string, setId: string, task: number) =>
  `esol-trainer:draft:${scope}:${level}:${setId}:${task}`;

async function requestFeedback(level: LevelSpec, task: WritingTask, answer: string): Promise<WritingFeedback> {
  const spec = level.writing[task.task - 1];
  const response = await fetch("/api/writing-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      level: level.name,
      cefr: level.cefr,
      task: task.task,
      focus: spec.focus,
      register: task.register,
      minWords: spec.minWords,
      maxWords: spec.maxWords,
      instructions: task.instructions,
      input: task.input,
      answer,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as WritingFeedback;
}

export function WritingSection({ level, setId, tasks, onFinish }: Props) {
  const [answers, setAnswers] = useState<string[]>(() => tasks.map(() => ""));
  const [states, setStates] = useState<TaskState[]>(() => tasks.map(() => ({})));
  const [finishing, setFinishing] = useState(false);
  const scope = onFinish ? "mock" : "practice";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drafts live in localStorage, which only exists after hydration
    setAnswers(tasks.map((task) => localStorage.getItem(draftKey(scope, level.id, setId, task.task)) ?? ""));
  }, [scope, level.id, setId, tasks]);

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? value : answer)));
    localStorage.setItem(draftKey(scope, level.id, setId, tasks[index].task), value);
  }

  function updateState(index: number, state: TaskState) {
    setStates((prev) => prev.map((current, i) => (i === index ? state : current)));
  }

  async function markTask(index: number): Promise<WritingFeedback | undefined> {
    updateState(index, { loading: true });
    try {
      const feedback = await requestFeedback(level, tasks[index], answers[index]);
      updateState(index, { feedback });
      return feedback;
    } catch (error) {
      updateState(index, { error: error instanceof Error ? error.message : "Request failed" });
    }
  }

  async function markAll() {
    setFinishing(true);
    const results = await Promise.all(tasks.map((_, index) => (answers[index].trim() ? markTask(index) : undefined)));
    setFinishing(false);
    const marked = results.every(Boolean);
    const raw = marked ? results.reduce((sum, feedback) => sum + (feedback?.total ?? 0), 0) : null;
    const max = tasks.length * 12;

    if (onFinish) {
      onFinish(raw, max);
    } else if (raw !== null) {
      saveAttempt({ level: level.id, setId, section: "writing", raw, rawMax: max, score: scaleToSection(raw, max), outOf: 50 });
    }
  }

  const allMarked = states.every((state) => state.feedback);
  const writingTotal = states.reduce((sum, state) => sum + (state.feedback?.total ?? 0), 0);

  return (
    <div className="space-y-12">
      {tasks.map((task, index) => {
        const spec = level.writing[task.task - 1];
        const words = countWords(answers[index]);
        const inRange = words >= spec.minWords && words <= spec.maxWords;
        const fill = Math.min(100, (words / spec.maxWords) * 100);
        const state = states[index];
        return (
          <section key={task.task} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">Writing · Part {task.task}</p>
              <span className="chip">{task.register === "formal" ? "Formal" : "Informal"}</span>
              <span className="chip">
                {spec.minWords} to {spec.maxWords} words
              </span>
            </div>

            <div className="card space-y-4">
              <p className="leading-relaxed whitespace-pre-line text-stone-700">{task.instructions}</p>
              {task.input && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed whitespace-pre-line text-amber-950">
                  {task.input}
                </div>
              )}
            </div>

            <div className="card overflow-hidden p-0">
              <textarea
                value={answers[index]}
                onChange={(event) => updateAnswer(index, event.target.value)}
                rows={14}
                aria-label={`Your answer for writing part ${task.task}`}
                className="block w-full resize-y border-0 bg-white px-6 py-5 text-[17px] leading-8 text-stone-800 outline-none placeholder:text-stone-400"
                placeholder="Start writing your answer here…"
              />
              <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 bg-stone-50/70 px-5 py-3">
                <div className="flex min-w-48 flex-1 items-center gap-3">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full transition-all ${inRange ? "bg-emerald-500" : words > spec.maxWords ? "bg-rose-500" : "bg-amber-400"}`}
                      style={{ width: `${fill}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${inRange ? "text-emerald-700" : "text-stone-600"}`}>
                    {words} words
                  </span>
                </div>
                {!onFinish && (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!answers[index].trim() || state.loading}
                    onClick={() => markTask(index)}
                  >
                    {state.loading ? "Marking…" : state.feedback ? "Mark again" : "Get feedback"}
                  </button>
                )}
              </div>
            </div>

            {state.error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>
            )}
            {state.feedback && <WritingFeedbackView feedback={state.feedback} />}
          </section>
        );
      })}

      <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
        {onFinish ? (
          <button type="button" className="btn-primary" disabled={finishing} onClick={markAll}>
            {finishing ? "Marking your writing…" : "Finish and mark writing"}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={finishing || answers.every((answer) => !answer.trim())}
              onClick={markAll}
            >
              {finishing ? "Marking…" : "Mark both tasks and save score"}
            </button>
            {allMarked && (
              <span className="font-semibold text-stone-800">
                Writing: {writingTotal} / {tasks.length * 12}, about {scaleToSection(writingTotal, tasks.length * 12)} / 50
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
