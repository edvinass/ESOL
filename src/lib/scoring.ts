import { WRITTEN_HIGH_PASS, WRITTEN_MAX, WRITTEN_PASS } from "@/content/levels";
import type { Part, Question } from "@/content/schema";

export type Responses = Record<string, string>;

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}'£$€%:.\s]/gu, " ")
    .replace(/\.(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCorrect(question: Question, response: string | undefined): boolean {
  if (response === undefined || response === "") return false;
  switch (question.kind) {
    case "choice":
      return Number(response) === question.answer;
    case "select":
      return response === question.answer;
    case "text": {
      const given = normalizeAnswer(response);
      return question.accepted.some((accepted) => normalizeAnswer(accepted) === given);
    }
  }
}

export function scoreParts(parts: Part[], responses: Responses) {
  let raw = 0;
  let max = 0;
  const byPart = parts.map((part) => {
    const questions = part.groups.flatMap((group) => group.questions);
    const correct = questions.filter((question) => isCorrect(question, responses[question.id])).length;
    raw += correct;
    max += questions.length;
    return { part: part.part, correct, total: questions.length };
  });
  return { raw, max, byPart };
}

/** Each written section carries a third of the 150 marks. */
export function scaleToSection(raw: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((raw / max) * (WRITTEN_MAX / 3));
}

export type Grade = "High Pass" | "Pass" | "Fail";

export function writtenGrade(total: number): Grade {
  if (total >= WRITTEN_HIGH_PASS) return "High Pass";
  if (total >= WRITTEN_PASS) return "Pass";
  return "Fail";
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
