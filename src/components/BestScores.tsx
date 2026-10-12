"use client";

import type { LevelId } from "@/content/schema";
import { useAttempts, type AttemptSection } from "@/lib/progress";

export function BestScore({ level, setId, section }: { level: LevelId; setId: string; section: AttemptSection }) {
  const scores = useAttempts().filter(
    (attempt) => attempt.level === level && attempt.setId === setId && attempt.section === section,
  );
  if (scores.length === 0) return <span className="text-xs text-stone-400">Not tried yet</span>;

  const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
  const pct = best.score / best.outOf;
  const tone = pct >= 0.67 ? "text-emerald-700" : pct >= 0.5 ? "text-amber-700" : "text-rose-700";
  return (
    <span className={`text-xs font-semibold ${tone}`}>
      Best {best.score}/{best.outOf}
    </span>
  );
}
