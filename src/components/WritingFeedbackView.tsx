import { CRITERIA_LABELS, type WritingFeedback } from "@/lib/writing-feedback";

export function WritingFeedbackView({ feedback }: { feedback: WritingFeedback }) {
  return (
    <div className="card space-y-6 border-indigo-200">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Examiner feedback</p>
          <p className="mt-2 leading-relaxed text-stone-700">{feedback.summary}</p>
        </div>
        <div className="rounded-2xl bg-indigo-600 px-5 py-3 text-center text-white">
          <p className="font-display text-3xl font-semibold">{feedback.total}</p>
          <p className="text-xs text-indigo-200">out of 12</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(Object.keys(CRITERIA_LABELS) as (keyof typeof CRITERIA_LABELS)[]).map((key) => {
          const { score, comment } = feedback.criteria[key];
          return (
            <div key={key} className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-stone-800">{CRITERIA_LABELS[key]}</span>
                <span className="flex gap-1" aria-label={`${score} out of 3`}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`h-2 w-6 rounded-full ${n <= score ? "bg-indigo-500" : "bg-stone-200"}`} />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{comment}</p>
            </div>
          );
        })}
      </div>

      {feedback.strengths.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold text-emerald-800">What went well</h4>
          <ul className="space-y-1.5 text-sm text-stone-700">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.corrections.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold text-stone-800">Corrections</h4>
          <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 text-sm">
            {feedback.corrections.map((correction, index) => (
              <li key={index} className="space-y-1 px-4 py-3">
                <p>
                  <span className="rounded bg-rose-50 px-1 text-rose-700 line-through decoration-rose-400">
                    {correction.original}
                  </span>
                  <span className="mx-2 text-stone-400">→</span>
                  <span className="rounded bg-emerald-50 px-1 font-medium text-emerald-800">{correction.corrected}</span>
                </p>
                <p className="text-stone-500">{correction.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="rounded-xl bg-stone-50 px-4 py-3">
        <summary className="cursor-pointer font-semibold text-stone-800">See an improved version</summary>
        <p className="mt-3 text-[15px] leading-7 whitespace-pre-line text-stone-700">{feedback.improvedVersion}</p>
      </details>
    </div>
  );
}
