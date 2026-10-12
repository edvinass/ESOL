"use client";

import type { Part, Question } from "@/content/schema";
import { isCorrect, type Responses } from "@/lib/scoring";
import { AudioPlayer } from "./AudioPlayer";
import { CheckIcon, CrossIcon } from "./icons";

type Props = {
  part: Part;
  section: "listening" | "reading";
  responses: Responses;
  onChange: (questionId: string, value: string) => void;
  reviewing: boolean;
  audioSrc: (audioId: string) => string | undefined;
  maxPlays: number | null;
  speechRate?: number;
  questionNumbers: Record<string, number>;
};

const LETTERS = ["A", "B", "C"];

function Paragraphs({ text, withTitle = false }: { text: string; withTitle?: boolean }) {
  const [first, ...rest] = text.split(/\n\s*\n/);
  const hasTitle = withTitle && rest.length > 0 && first.length < 80 && !/[.?!,]$/.test(first);
  const paragraphs = hasTitle ? rest : [first, ...rest];

  return (
    <div className="space-y-3 leading-relaxed text-stone-700">
      {hasTitle && <h4 className="font-display text-xl font-semibold text-stone-900">{first}</h4>}
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph.split(/(\[\d+\])/).map((chunk, i) =>
            /^\[\d+\]$/.test(chunk) ? (
              <span
                key={i}
                className="mx-1 inline-grid h-6 min-w-6 place-items-center rounded-md bg-amber-100 px-1.5 text-sm font-bold text-amber-800 ring-1 ring-amber-300"
              >
                {chunk.slice(1, -1)}
              </span>
            ) : (
              chunk
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function correctAnswerLabel(question: Question, part: Part): string {
  switch (question.kind) {
    case "choice":
      return `${LETTERS[question.answer]}: ${question.options[question.answer]}`;
    case "select": {
      const option = part.selectOptions?.find((o) => o.key === question.answer);
      return option && option.label !== option.key ? `${option.key}: ${option.label}` : question.answer;
    }
    case "text":
      return question.accepted.join(" / ");
  }
}

function optionTone(reviewing: boolean, index: number, question: Question & { kind: "choice" }, value?: string) {
  if (!reviewing) {
    return "border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/40 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-indigo-100";
  }
  if (index === question.answer) return "border-emerald-400 bg-emerald-50";
  if (value === String(index)) return "border-rose-300 bg-rose-50";
  return "border-stone-200 opacity-60";
}

function QuestionCard({
  question,
  part,
  value,
  onChange,
  reviewing,
  number,
}: {
  question: Question;
  part: Part;
  value: string | undefined;
  onChange: (value: string) => void;
  reviewing: boolean;
  number: number;
}) {
  const correct = reviewing && isCorrect(question, value);

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${
            !reviewing
              ? value
                ? "bg-indigo-600 text-white"
                : "bg-stone-100 text-stone-600"
              : correct
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
          }`}
        >
          {reviewing ? correct ? <CheckIcon width={16} height={16} /> : <CrossIcon width={16} height={16} /> : number}
        </span>
        <p className="pt-0.5 font-medium whitespace-pre-line text-stone-800">
          {question.prompt ?? `Question ${number}`}
        </p>
      </div>

      {question.kind === "choice" && (
        <div className="grid gap-2">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 transition ${reviewing ? "" : "cursor-pointer"} ${optionTone(reviewing, index, question, value)}`}
            >
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={value === String(index)}
                disabled={reviewing}
                onChange={() => onChange(String(index))}
                className="peer sr-only"
              />
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-stone-300 bg-white text-xs font-bold text-stone-600 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white">
                {LETTERS[index]}
              </span>
              <span className="text-stone-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.kind === "select" && (
        <select
          aria-label={`Question ${number}`}
          value={value ?? ""}
          disabled={reviewing}
          onChange={(event) => onChange(event.target.value)}
          className={`input w-full sm:w-auto sm:min-w-56 ${reviewing ? (correct ? "border-emerald-400 bg-emerald-50" : "border-rose-300 bg-rose-50") : ""}`}
        >
          <option value="">Choose an answer…</option>
          {part.selectOptions?.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label === option.key || part.texts ? option.key : `${option.key}: ${option.label.slice(0, 80)}`}
            </option>
          ))}
        </select>
      )}

      {question.kind === "text" && (
        <input
          type="text"
          aria-label={`Question ${number}`}
          value={value ?? ""}
          disabled={reviewing}
          onChange={(event) => onChange(event.target.value)}
          className={`input w-full ${reviewing ? (correct ? "border-emerald-400 bg-emerald-50" : "border-rose-300 bg-rose-50") : ""}`}
          placeholder="Type your answer"
          autoComplete="off"
          spellCheck={false}
        />
      )}

      {reviewing && (!correct || question.explanation) && (
        <div className="mt-3 space-y-1 rounded-xl bg-stone-50 px-3.5 py-2.5 text-sm">
          {!correct && question.kind !== "choice" && (
            <p>
              <span className="font-semibold text-emerald-700">Correct answer:</span> {correctAnswerLabel(question, part)}
            </p>
          )}
          {question.explanation && <p className="text-stone-600">{question.explanation}</p>}
        </div>
      )}
    </div>
  );
}

export function PartView({
  part,
  section,
  responses,
  onChange,
  reviewing,
  audioSrc,
  maxPlays,
  speechRate,
  questionNumbers,
}: Props) {
  const showOptionList = part.selectOptions && !part.texts && part.selectOptions.some((o) => o.label !== o.key);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="eyebrow">
          {section} · Part {part.part}
        </p>
        <p className="text-lg leading-relaxed text-stone-700">{part.instructions}</p>
      </header>

      {part.passage && (
        <article className="card p-6 sm:p-8">
          <Paragraphs text={part.passage} withTitle />
        </article>
      )}

      {showOptionList && (
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-stone-500 uppercase">Options</h3>
          <ul className="space-y-2.5">
            {part.selectOptions!.map((option) => (
              <li key={option.key} className="flex gap-3 text-stone-700">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-stone-100 text-xs font-bold text-stone-700">
                  {option.key}
                </span>
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {part.texts && (
        <div className="grid gap-4 md:grid-cols-2">
          {part.texts.map((text) => (
            <article key={text.key} className="card">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                  {text.key}
                </span>
                {text.title && <h3 className="font-semibold text-stone-800">{text.title}</h3>}
              </div>
              <div className="text-sm">
                <Paragraphs text={text.body} />
              </div>
            </article>
          ))}
        </div>
      )}

      {part.groups.map((group) => (
        <div key={group.id} className="space-y-3">
          {group.title && <h3 className="font-display text-lg font-semibold">{group.title}</h3>}
          {group.audio && (
            <AudioPlayer audio={group.audio} src={audioSrc(group.audio.id)} maxPlays={maxPlays} rate={speechRate} />
          )}
          {group.text && (
            <div className="card">
              <Paragraphs text={group.text} />
            </div>
          )}
          <div className="space-y-3">
            {group.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                part={part}
                value={responses[question.id]}
                onChange={(value) => onChange(question.id, value)}
                reviewing={reviewing}
                number={questionNumbers[question.id]}
              />
            ))}
          </div>
          {reviewing && group.audio && (
            <details className="group rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm">
              <summary className="cursor-pointer font-semibold text-stone-700">Show transcript</summary>
              <div className="mt-3 space-y-2 leading-relaxed text-stone-700">
                {group.audio.segments.map((segment, index) => (
                  <p key={index}>
                    <span className="font-semibold text-stone-900">{segment.speaker}:</span> {segment.text}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
      ))}
    </section>
  );
}
