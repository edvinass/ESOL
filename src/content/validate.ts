import type { LevelSpec, PartSpec } from "./levels";
import type { Part, PracticeSet } from "./schema";

function checkPart(section: string, part: Part, spec: PartSpec, errors: string[]) {
  const label = `${section} part ${spec.part}`;
  const questions = part.groups.flatMap((group) => group.questions);

  if (part.part !== spec.part) errors.push(`${label}: numbered ${part.part}`);
  if (questions.length !== spec.questions) {
    errors.push(`${label}: expected ${spec.questions} questions, found ${questions.length}`);
  }

  for (const question of questions) {
    if (question.kind !== spec.kind) {
      errors.push(`${label}: question ${question.id} is "${question.kind}", expected "${spec.kind}"`);
    }
    if (question.kind === "select") {
      const keys = new Set((part.selectOptions ?? []).map((option) => option.key));
      if (!keys.has(question.answer)) {
        errors.push(`${label}: question ${question.id} answer "${question.answer}" is not a listed option`);
      }
    }
  }

  if (spec.kind === "select" && (part.selectOptions?.length ?? 0) !== spec.selectOptions) {
    errors.push(`${label}: expected ${spec.selectOptions} options, found ${part.selectOptions?.length ?? 0}`);
  }

  if (section === "listening") {
    for (const group of part.groups) {
      if (!group.audio) errors.push(`${label}: group ${group.id} has no audio script`);
    }
  }
}

export function validateSection(section: "listening" | "reading", parts: Part[], spec: LevelSpec): string[] {
  const errors: string[] = [];
  if (parts.length !== spec[section].length) errors.push(`${section}: expected ${spec[section].length} parts`);
  spec[section].forEach((partSpec, index) => {
    const part = parts[index];
    if (part) checkPart(section, part, partSpec, errors);
  });
  return errors;
}

export function validateAgainstSpec(set: PracticeSet, spec: LevelSpec): string[] {
  const errors: string[] = [
    ...validateSection("listening", set.listening, spec),
    ...validateSection("reading", set.reading, spec),
  ];
  if (set.level !== spec.id) errors.push(`set level "${set.level}" does not match "${spec.id}"`);

  const ids = new Set<string>();
  for (const part of [...set.listening, ...set.reading]) {
    for (const group of part.groups) {
      for (const question of group.questions) {
        if (ids.has(question.id)) errors.push(`duplicate question id ${question.id}`);
        ids.add(question.id);
      }
    }
  }

  return errors;
}
