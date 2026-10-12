import Link from "next/link";
import { notFound } from "next/navigation";
import { io } from "next/cache";
import { Suspense } from "react";
import { getLevel, LEVELS } from "@/content/levels";
import { hasAllAudio, listSets } from "@/lib/content";
import { BestScore } from "@/components/BestScores";
import { GenerateAudioButton, GenerateSetButton } from "@/components/Generation";
import { LEVEL_THEME } from "@/components/levelTheme";
import {
  ArrowLeftIcon,
  BookIcon,
  ClockIcon,
  HeadphonesIcon,
  MicIcon,
  PenIcon,
  TrophyIcon,
} from "@/components/icons";

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: level.id }));
}

const SPEAKING_PARTS = [
  "Personal questions: spell your name, say where you are from, then answer questions on everyday topics",
  "Role-plays: two or three short situations where you respond or start the conversation",
  "Discussion: plan, arrange or decide something together using a written prompt",
  "Long turn: prepare for 30 seconds, talk on your own, then answer follow-up questions",
];

const SECTION_TILES = [
  { section: "listening", label: "Listening", icon: HeadphonesIcon },
  { section: "reading", label: "Reading", icon: BookIcon },
  { section: "writing", label: "Writing", icon: PenIcon },
] as const;

export default function LevelPage({ params }: PageProps<"/[level]">) {
  return (
    <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
      <LevelContent params={params} />
    </Suspense>
  );
}

async function LevelContent({ params }: { params: PageProps<"/[level]">["params"] }) {
  const { level: levelId } = await params;
  const level = getLevel(levelId);
  if (!level) notFound();
  await io();
  const sets = listSets(level.id);
  const theme = LEVEL_THEME[level.id];

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
          <ArrowLeftIcon width={16} height={16} />
          All levels
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`rounded-xl px-3 py-1.5 text-lg font-bold ${theme.badge}`}>{level.cefr}</span>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{level.name}</h1>
        </div>
        <p className="max-w-2xl text-stone-600">{theme.summary}</p>
        <div className="flex flex-wrap gap-2">
          <span className="chip">
            <ClockIcon width={14} height={14} /> Listening about {level.listeningMinutes} min
          </span>
          <span className="chip">
            <ClockIcon width={14} height={14} /> Reading and writing {level.readingWritingMinutes} min
          </span>
          <span className="chip">
            <ClockIcon width={14} height={14} /> Speaking {level.speaking.totalMinutes} min
          </span>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Practice sets</h2>
        {sets.length === 0 && (
          <p className="text-stone-600">There are no practice sets for this level yet. Create the first one below.</p>
        )}
        {sets.map((set) => (
            <div key={set.id} className="card space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{set.title}</h3>
                <Link href={`/${level.id}/${set.id}/mock`} className="btn-primary">
                  <TrophyIcon width={16} height={16} />
                  Full mock exam
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {SECTION_TILES.map(({ section, label, icon: TileIcon }) => (
                  <Link
                    key={section}
                    href={`/${level.id}/${set.id}/${section}`}
                    className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition hover:border-indigo-300 hover:bg-white"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <TileIcon />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold group-hover:text-indigo-700">{label}</span>
                      <BestScore level={level.id} setId={set.id} section={section} />
                    </span>
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <span className="flex items-center gap-2 text-sm text-stone-500">
                  <TrophyIcon width={16} height={16} />
                  Mock exam: <BestScore level={level.id} setId={set.id} section="mock" />
                </span>
                {!hasAllAudio(set) && <GenerateAudioButton level={level.id} setId={set.id} />}
              </div>
            </div>
        ))}
        <GenerateSetButton level={level.id} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">What&apos;s in the exam</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(["listening", "reading"] as const).map((section) => (
            <FormatCard
              key={section}
              icon={section === "listening" ? HeadphonesIcon : BookIcon}
              title={section === "listening" ? "Listening" : "Reading"}
              items={level[section].map((part) => ({
                label: `Part ${part.part}`,
                meta: `${part.questions} questions`,
                text: part.task,
              }))}
            />
          ))}
          <FormatCard
            icon={PenIcon}
            title="Writing"
            items={level.writing.map((task) => ({
              label: `Part ${task.task}`,
              meta: `${task.minWords} to ${task.maxWords} words`,
              text: task.focus,
            }))}
          />
          <FormatCard
            icon={MicIcon}
            title="Speaking"
            badge="Coming soon"
            items={SPEAKING_PARTS.map((text, index) => ({
              label: `Part ${index + 1}`,
              meta: `${level.speaking.partMinutes[index]} min`,
              text: index === 3 ? `${text} (${level.speaking.longTurnSeconds} seconds talking)` : text,
            }))}
          />
        </div>
      </section>
    </div>
  );
}

function FormatCard({
  icon: CardIcon,
  title,
  badge,
  items,
}: {
  icon: typeof BookIcon;
  title: string;
  badge?: string;
  items: { label: string; meta: string; text: string }[];
}) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          <CardIcon />
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
        {badge && <span className="chip ml-auto bg-amber-100 text-amber-800">{badge}</span>}
      </div>
      <ol className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="grid grid-cols-[4.5rem_1fr] gap-3 text-sm">
            <span className="pt-0.5">
              <span className="block font-semibold text-stone-800">{item.label}</span>
              <span className="block text-xs text-stone-500">{item.meta}</span>
            </span>
            <span className="leading-relaxed text-stone-600">{item.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
