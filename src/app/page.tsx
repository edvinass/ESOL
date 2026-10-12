import Link from "next/link";
import { io } from "next/cache";
import { Suspense } from "react";
import { LEVELS, OFFICIAL_MATERIALS_URL } from "@/content/levels";
import type { LevelId } from "@/content/schema";
import { listSets } from "@/lib/content";
import { LEVEL_THEME } from "@/components/levelTheme";
import { ArrowRightIcon, BookIcon, HeadphonesIcon, MicIcon, PenIcon } from "@/components/icons";

const SKILLS = [
  { icon: HeadphonesIcon, title: "Listening", text: "26 questions in 4 parts. Each recording plays twice." },
  { icon: BookIcon, title: "Reading", text: "26 questions: gapped texts, matching and short answers." },
  { icon: PenIcon, title: "Writing", text: "2 tasks marked on the four official criteria." },
  { icon: MicIcon, title: "Speaking", text: "A 4-part interview with an examiner. Coming soon." },
];

async function StartButton() {
  await io();
  const level = LEVELS.find((candidate) => listSets(candidate.id).length > 0) ?? LEVELS[0];
  return (
    <Link href={`/${level.id}`} className="btn-primary">
      Start with {level.cefr} {level.name}
      <ArrowRightIcon width={16} height={16} />
    </Link>
  );
}

async function SetCount({ level, accent }: { level: LevelId; accent: string }) {
  await io();
  const sets = listSets(level).length;
  return (
    <>
      <span className={`h-1.5 w-1.5 rounded-full ${sets > 0 ? accent : "bg-stone-300"}`} />
      {sets === 0 ? "No practice sets yet" : `${sets} practice set${sets === 1 ? "" : "s"}`}
    </>
  );
}

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <p className="eyebrow">LanguageCert International ESOL</p>
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Practise for the real exam, <span className="text-indigo-600">part by part.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-stone-600">
            Original practice papers in the official format for every level from A1 to C2, with instant marking,
            timed mock exams and feedback on your writing from an AI examiner.
          </p>
          <div className="flex flex-wrap gap-3">
            <Suspense fallback={<span className="btn-primary opacity-0">Start</span>}>
              <StartButton />
            </Suspense>
            <a href="#levels" className="btn-secondary">
              Choose a level
            </a>
          </div>
        </div>

        <div className="card grid grid-cols-2 gap-3 p-4">
          {SKILLS.map(({ icon: SkillIcon, title, text }) => (
            <div key={title} className="rounded-xl bg-stone-50 p-4">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
                <SkillIcon />
              </span>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-snug text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="levels" className="scroll-mt-24 space-y-5">
        <div>
          <p className="eyebrow">Levels</p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Pick your level</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((level) => {
            const theme = LEVEL_THEME[level.id];
            return (
              <Link
                key={level.id}
                href={`/${level.id}`}
                className={`card group relative overflow-hidden bg-gradient-to-b ${theme.softBg} to-white to-60% transition hover:-translate-y-0.5 ${theme.hoverBorder}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${theme.badge}`}>{level.cefr}</span>
                  <ArrowRightIcon className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-stone-600" />
                </div>
                <p className="mt-4 font-display text-2xl font-semibold">{level.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{theme.summary}</p>
                <div className="mt-5 flex items-center gap-2 text-xs text-stone-500">
                  <Suspense fallback={<span>Loading…</span>}>
                    <SetCount level={level.id} accent={theme.accent} />
                  </Suspense>
                  <span className="text-stone-300">·</span>
                  {level.listeningMinutes + level.readingWritingMinutes} min written
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <p className="eyebrow">Written exam</p>
          <p className="font-display text-4xl font-semibold">
            75<span className="text-xl text-stone-400"> / 150 to pass</span>
          </p>
          <p className="text-sm leading-relaxed text-stone-600">
            Listening, reading and writing are each worth 50 marks. A High Pass needs 101 or more. There is no minimum
            score for each section, so a strong section can make up for a weaker one.
          </p>
        </div>
        <div className="card space-y-3">
          <p className="eyebrow">Spoken exam</p>
          <p className="font-display text-4xl font-semibold">
            25<span className="text-xl text-stone-400"> / 50 to pass</span>
          </p>
          <p className="text-sm leading-relaxed text-stone-600">
            A live interview of 6 to 17 minutes: personal questions, role-plays, a discussion and a long turn. A High
            Pass needs 38 or more.
          </p>
        </div>
      </section>

      <p className="text-sm text-stone-500">
        Official practice papers are on the{" "}
        <a href={OFFICIAL_MATERIALS_URL} className="font-medium text-indigo-600 underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
          LanguageCert practice material page
        </a>
        . All tasks on this site are original and follow the published exam format.
      </p>
    </div>
  );
}
