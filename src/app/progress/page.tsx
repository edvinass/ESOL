"use client";

import Link from "next/link";
import { getLevel } from "@/content/levels";
import { LEVEL_THEME } from "@/components/levelTheme";
import { clearAttempts, useAttempts } from "@/lib/progress";

export default function ProgressPage() {
  const attempts = [...useAttempts()].reverse();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your history</p>
          <h1 className="font-display mt-1 text-4xl font-semibold">Progress</h1>
          <p className="mt-2 text-stone-600">Every scored attempt is saved in this browser.</p>
        </div>
        {attempts.length > 0 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => confirm("Delete all saved scores?") && clearAttempts()}
          >
            Clear history
          </button>
        )}
      </div>

      {attempts.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-stone-600">No attempts yet.</p>
          <Link href="/#levels" className="btn-primary mt-4">
            Pick a level
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs tracking-wider text-stone-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Level</th>
                <th className="px-5 py-3 font-semibold">Set</th>
                <th className="px-5 py-3 font-semibold">Section</th>
                <th className="px-5 py-3 font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {attempts.map((attempt) => {
                const level = getLevel(attempt.level);
                const percent = Math.round((attempt.score / attempt.outOf) * 100);
                return (
                  <tr key={attempt.id} className="hover:bg-stone-50/60">
                    <td className="px-5 py-3 whitespace-nowrap text-stone-500">{new Date(attempt.date).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {level ? (
                        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${LEVEL_THEME[level.id].badge}`}>
                          {level.cefr}
                        </span>
                      ) : (
                        attempt.level
                      )}
                    </td>
                    <td className="px-5 py-3 text-stone-600">{attempt.setId}</td>
                    <td className="px-5 py-3 capitalize">{attempt.section}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold whitespace-nowrap">
                          {attempt.score} / {attempt.outOf}
                        </span>
                        <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-stone-100 sm:block">
                          <div
                            className={`h-full rounded-full ${percent >= 50 ? "bg-emerald-500" : "bg-amber-400"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
