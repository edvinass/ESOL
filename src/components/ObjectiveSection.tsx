"use client";

import { useMemo, useState } from "react";
import type { LevelId, Part } from "@/content/schema";
import { saveAttempt } from "@/lib/progress";
import { scaleToSection, scoreParts, type Responses } from "@/lib/scoring";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { PartView } from "./PartView";

type Props = {
  level: LevelId;
  setId: string;
  section: "listening" | "reading";
  parts: Part[];
  audioIds: string[];
  /** When set, the section is part of a mock and reports its score instead of saving it. */
  onFinish?: (raw: number, max: number) => void;
};

const SPEECH_RATE: Record<LevelId, number> = { a1: 0.8, a2: 0.85, b1: 0.9, b2: 0.95, c1: 1, c2: 1 };

export function ObjectiveSection({ level, setId, section, parts, audioIds, onFinish }: Props) {
  const [responses, setResponses] = useState<Responses>({});
  const [current, setCurrent] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [examRules, setExamRules] = useState(true);

  const available = useMemo(() => new Set(audioIds), [audioIds]);
  const questionNumbers = useMemo(() => {
    const numbers: Record<string, number> = {};
    let n = 1;
    for (const part of parts) for (const group of part.groups) for (const q of group.questions) numbers[q.id] = n++;
    return numbers;
  }, [parts]);

  const result = useMemo(() => scoreParts(parts, responses), [parts, responses]);
  const answered = Object.values(responses).filter(Boolean).length;
  const total = Object.keys(questionNumbers).length;

  function submit() {
    if (answered < total && !confirm(`You have answered ${answered} of ${total} questions. Submit anyway?`)) return;
    if (onFinish) {
      onFinish(result.raw, result.max);
      return;
    }
    saveAttempt({
      level,
      setId,
      section,
      raw: result.raw,
      rawMax: result.max,
      score: scaleToSection(result.raw, result.max),
      outOf: 50,
    });
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(index: number) {
    setCurrent(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const scaled = scaleToSection(result.raw, result.max);

  return (
    <div className="space-y-8">
      {reviewing && (
        <div className="card overflow-hidden p-0">
          <div className="flex flex-wrap items-center gap-6 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
            <div>
              <p className="text-sm font-medium text-indigo-100">Your score</p>
              <p className="font-display text-4xl font-semibold">
                {scaled}
                <span className="text-xl text-indigo-200"> / 50</span>
              </p>
            </div>
            <p className="text-indigo-100">
              {result.raw} of {result.max} questions correct. Review each part below.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-stone-100 sm:grid-cols-4">
            {result.byPart.map((part) => (
              <div key={part.part} className="bg-white px-5 py-3">
                <p className="text-xs font-medium text-stone-500">Part {part.part}</p>
                <p className="font-semibold">
                  {part.correct} / {part.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-[61px] z-10 -mx-2 rounded-2xl border border-stone-200/80 bg-white/90 px-2 py-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-1">
          {parts.map((part, index) => {
            const questions = part.groups.flatMap((group) => group.questions);
            const done = questions.filter((q) => responses[q.id]).length;
            return (
              <button
                key={part.part}
                type="button"
                onClick={() => goTo(index)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  index === current ? "bg-indigo-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                Part {part.part}
                <span className={`ml-2 text-xs font-medium ${index === current ? "text-indigo-200" : "text-stone-400"}`}>
                  {done}/{questions.length}
                </span>
              </button>
            );
          })}
          <span className="ml-auto px-3 text-sm text-stone-500">
            {answered} of {total} answered
          </span>
        </div>
        <div className="mx-2 mt-2 h-1 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      {section === "listening" && !onFinish && !reviewing && (
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={examRules}
            onChange={(event) => setExamRules(event.target.checked)}
            className="h-4 w-4 accent-indigo-600"
          />
          Exam rules: each recording can be played twice
        </label>
      )}

      <PartView
        key={current}
        part={parts[current]}
        section={section}
        responses={responses}
        onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
        reviewing={reviewing}
        audioSrc={(id) => (available.has(id) ? `/audio/${level}/${setId}/${id}.mp3` : undefined)}
        maxPlays={reviewing || !examRules ? null : 2}
        speechRate={SPEECH_RATE[level]}
        questionNumbers={questionNumbers}
      />

      <div className="flex flex-wrap justify-between gap-3 border-t border-stone-200 pt-6">
        {current > 0 ? (
          <button type="button" className="btn-secondary" onClick={() => goTo(current - 1)}>
            <ArrowLeftIcon width={16} height={16} />
            Previous part
          </button>
        ) : (
          <span />
        )}
        {current < parts.length - 1 ? (
          <button type="button" className="btn-primary" onClick={() => goTo(current + 1)}>
            Next part
            <ArrowRightIcon width={16} height={16} />
          </button>
        ) : (
          !reviewing && (
            <button type="button" className="btn-primary" onClick={submit}>
              {onFinish ? "Finish section" : "Submit answers"}
            </button>
          )
        )}
      </div>
    </div>
  );
}
