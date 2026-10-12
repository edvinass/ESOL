import Link from "next/link";
import { io } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLevel } from "@/content/levels";
import { ArrowLeftIcon } from "@/components/icons";
import { MockExam } from "@/components/MockExam";
import { ObjectiveSection } from "@/components/ObjectiveSection";
import { WritingSection } from "@/components/WritingSection";
import { allSetParams, getSet } from "@/lib/content";
import { recordedAudioIds } from "@/lib/storage";

const SECTIONS = ["listening", "reading", "writing", "mock"] as const;
type SectionParam = (typeof SECTIONS)[number];

const TITLES: Record<SectionParam, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  mock: "Mock exam",
};

export function generateStaticParams() {
  return allSetParams().flatMap((params) => SECTIONS.map((section) => ({ ...params, section })));
}

type Params = PageProps<"/[level]/[setId]/[section]">["params"];

export default function SectionPage({ params }: PageProps<"/[level]/[setId]/[section]">) {
  return (
    <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
      <SectionContent params={params} />
    </Suspense>
  );
}

async function SectionContent({ params }: { params: Params }) {
  const { level: levelId, setId, section } = await params;
  const level = getLevel(levelId);
  if (!level || !SECTIONS.includes(section as SectionParam)) notFound();
  await io();
  const set = getSet(level.id, setId);
  if (!set) notFound();
  const audioIds = recordedAudioIds(level.id, set.id);
  const sectionParam = section as SectionParam;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-3">
        <Link
          href={`/${level.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          <ArrowLeftIcon width={16} height={16} />
          {level.cefr} {level.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{TITLES[sectionParam]}</h1>
          <span className="text-stone-500">{set.title}</span>
        </div>
      </header>

      {sectionParam === "mock" && <MockExam level={level} set={set} audioIds={audioIds} />}
      {(sectionParam === "listening" || sectionParam === "reading") && (
        <ObjectiveSection
          level={level.id}
          setId={set.id}
          section={sectionParam}
          parts={set[sectionParam]}
          audioIds={sectionParam === "listening" ? audioIds : []}
        />
      )}
      {sectionParam === "writing" && <WritingSection level={level} setId={set.id} tasks={set.writing} />}
    </div>
  );
}
