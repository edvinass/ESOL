"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LevelSpec } from "@/content/levels";
import type { PracticeSet } from "@/content/schema";
import { saveAttempt } from "@/lib/progress";
import { scaleToSection, writtenGrade } from "@/lib/scoring";
import { ArrowRightIcon, BookIcon, ClockIcon, HeadphonesIcon, PenIcon, TrophyIcon } from "./icons";
import { ObjectiveSection } from "./ObjectiveSection";
import { WritingSection } from "./WritingSection";

type Props = { level: LevelSpec; set: PracticeSet; audioIds: string[] };
type Step = "intro" | "listening" | "reading" | "writing" | "results";
type Score = { raw: number; max: number } | null;

function Countdown({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(0, Math.round((endsAt - now) / 1000));
  const minutes = Math.floor(left / 60);
  const seconds = String(left % 60).padStart(2, "0");
  return (
    <div
      className={`fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
        left < 300 ? "bg-rose-600 text-white" : "bg-stone-900 text-white"
      }`}
    >
      <ClockIcon width={16} height={16} />
      {left === 0 ? "Time is up" : <span className="tabular-nums">{minutes}:{seconds} left</span>}
    </div>
  );
}

export function MockExam({ level, set, audioIds }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [endsAt, setEndsAt] = useState(0);
  const [listening, setListening] = useState<Score>(null);
  const [reading, setReading] = useState<Score>(null);
  const [writing, setWriting] = useState<Score>(null);

  function startReading(raw: number, max: number) {
    setListening({ raw, max });
    setEndsAt(Date.now() + level.readingWritingMinutes * 60_000);
    setStep("reading");
    window.scrollTo({ top: 0 });
  }

  function finish(raw: number | null, max: number) {
    const writingScore = raw === null ? null : { raw, max };
    setWriting(writingScore);
    setStep("results");
    window.scrollTo({ top: 0 });
    if (listening && reading && writingScore) {
      const total =
        scaleToSection(listening.raw, listening.max) +
        scaleToSection(reading.raw, reading.max) +
        scaleToSection(writingScore.raw, writingScore.max);
      saveAttempt({
        level: level.id,
        setId: set.id,
        section: "mock",
        raw: listening.raw + reading.raw + writingScore.raw,
        rawMax: listening.max + reading.max + writingScore.max,
        score: total,
        outOf: 150,
      });
    }
  }

  if (step === "intro") {
    return (
      <div className="card space-y-6">
        <div>
          <p className="eyebrow">Exam conditions</p>
          <h2 className="font-display mt-1 text-2xl font-semibold">Full written mock exam</h2>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: HeadphonesIcon, title: "Listening", text: `About ${level.listeningMinutes} minutes. Each recording plays twice.` },
            { icon: BookIcon, title: "Reading", text: `Shares ${level.readingWritingMinutes} minutes with writing, with a countdown.` },
            { icon: PenIcon, title: "Writing", text: "Two tasks, marked by the AI examiner at the end." },
          ].map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Icon width={18} height={18} />
                <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">Step {index + 1}</span>
              </div>
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-stone-600">{text}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-stone-600">
          You see your score at the end. The pass mark is 75 out of 150 and there is no minimum per section.
        </p>
        <button type="button" className="btn-primary" onClick={() => setStep("listening")}>
          Start listening
          <ArrowRightIcon width={16} height={16} />
        </button>
      </div>
    );
  }

  if (step === "listening") {
    return <ObjectiveSection level={level.id} setId={set.id} section="listening" parts={set.listening} audioIds={audioIds} onFinish={startReading} />;
  }

  if (step === "reading" || step === "writing") {
    return (
      <div className="space-y-6">
        <Countdown endsAt={endsAt} />
        <div className={step === "reading" ? "" : "hidden"}>
          <ObjectiveSection
            level={level.id}
            setId={set.id}
            section="reading"
            parts={set.reading}
            audioIds={[]}
            onFinish={(raw, max) => {
              setReading({ raw, max });
              setStep("writing");
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
        {step === "writing" && <WritingSection level={level} setId={set.id} tasks={set.writing} onFinish={finish} />}
      </div>
    );
  }

  const rows = [
    { name: "Listening", score: listening },
    { name: "Reading", score: reading },
    { name: "Writing", score: writing },
  ];
  const marked = rows.every((row) => row.score);
  const total = rows.reduce((sum, row) => sum + (row.score ? scaleToSection(row.score.raw, row.score.max) : 0), 0);

  return (
    <div className="card overflow-hidden p-0">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-white">
        <div className="flex items-center gap-2 text-indigo-100">
          <TrophyIcon width={18} height={18} />
          <span className="text-sm font-medium">Mock exam results</span>
        </div>
        {marked ? (
          <p className="font-display mt-2 text-5xl font-semibold">
            {total}
            <span className="text-2xl text-indigo-200"> / 150</span>
            <span className="ml-4 inline-block rounded-full bg-white/20 px-3 py-1 align-middle font-sans text-base">
              {writtenGrade(total)}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-indigo-100">
            Writing could not be marked, so there is no overall grade. Add an OpenAI API key to get writing marks.
          </p>
        )}
      </div>
      <div className="grid gap-px bg-stone-100 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.name} className="bg-white px-6 py-4">
            <p className="text-sm text-stone-500">{row.name}</p>
            <p className="text-xl font-semibold">{row.score ? `${scaleToSection(row.score.raw, row.score.max)} / 50` : "Not marked"}</p>
            {row.score && (
              <p className="text-xs text-stone-400">
                {row.score.raw} / {row.score.max} raw
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <p className="text-sm text-stone-500">
          This is an estimate. Real exams use paper-specific marking and trained examiners.
        </p>
        <Link href={`/${level.id}`} className="btn-secondary">
          Back to {level.cefr} {level.name}
        </Link>
      </div>
    </div>
  );
}
