import type { LevelId } from "@/content/schema";

type LevelTheme = {
  summary: string;
  badge: string;
  accent: string;
  hoverBorder: string;
  softBg: string;
};

export const LEVEL_THEME: Record<LevelId, LevelTheme> = {
  a1: {
    summary: "Everyday phrases, simple personal details and very short texts.",
    badge: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-500",
    hoverBorder: "hover:border-emerald-300",
    softBg: "from-emerald-50",
  },
  a2: {
    summary: "Routine tasks, familiar topics and short, clear messages.",
    badge: "bg-teal-100 text-teal-800",
    accent: "bg-teal-500",
    hoverBorder: "hover:border-teal-300",
    softBg: "from-teal-50",
  },
  b1: {
    summary: "The main points of clear texts on work, school and leisure.",
    badge: "bg-sky-100 text-sky-800",
    accent: "bg-sky-500",
    hoverBorder: "hover:border-sky-300",
    softBg: "from-sky-50",
  },
  b2: {
    summary: "Complex texts, opinions and fluent interaction on many topics.",
    badge: "bg-indigo-100 text-indigo-800",
    accent: "bg-indigo-500",
    hoverBorder: "hover:border-indigo-300",
    softBg: "from-indigo-50",
  },
  c1: {
    summary: "Demanding, longer texts and flexible, well-structured expression.",
    badge: "bg-violet-100 text-violet-800",
    accent: "bg-violet-500",
    hoverBorder: "hover:border-violet-300",
    softBg: "from-violet-50",
  },
  c2: {
    summary: "Near-native precision with subtle meaning in any situation.",
    badge: "bg-rose-100 text-rose-800",
    accent: "bg-rose-500",
    hoverBorder: "hover:border-rose-300",
    softBg: "from-rose-50",
  },
};
