import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type OpenAI from "openai";
import { z } from "zod";
import type { LevelSpec, PartSpec } from "../../content/levels";
import { partSchema, practiceSetSchema, writingTaskSchema, type Part, type PracticeSet } from "../../content/schema";
import { validateAgainstSpec, validateSection } from "../../content/validate";
import { generateJson } from "../ai";
import { BUILTIN_SETS_DIR, generatedSetsDir, setFiles, setNumber } from "../storage";

const INSTRUCTIONS = `You write original practice material for the LanguageCert International ESOL exam.
Everything you write must be new. Never copy or paraphrase official LanguageCert papers.
Match the CEFR level closely: vocabulary, grammar, text length and the difficulty of distractors must suit the level.
Use British English, realistic everyday contexts and a variety of topics, names and accents of speakers.
Wrong options must be plausible but clearly wrong for a careful candidate. Spread correct answers across positions.
For "text" questions list every reasonable correct form in "accepted" (with and without articles, numerals and words).
Add a short "explanation" to each question saying why the answer is correct.`;

let example: PracticeSet | undefined;
function formatExample(): PracticeSet {
  example ??= JSON.parse(readFileSync(path.join(BUILTIN_SETS_DIR, "b2", "b2-set-1.json"), "utf8")) as PracticeSet;
  return example;
}

function describeParts(parts: PartSpec[]): string {
  return parts
    .map((part) => {
      const options = part.selectOptions ? `, ${part.selectOptions} shared selectOptions` : "";
      return `Part ${part.part}: ${part.focus}. Task: ${part.task} Exactly ${part.questions} questions of kind "${part.kind}"${options}.`;
    })
    .join("\n");
}

const sectionSchema = z.object({ parts: z.array(partSchema).length(4) });
const writingSchema = z.object({ writing: z.array(writingTaskSchema).length(2) });

async function generateSection(
  client: OpenAI,
  section: "listening" | "reading",
  level: LevelSpec,
  setId: string,
): Promise<Part[]> {
  let feedback = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const prompt = `Write the ${section} section of a ${level.cefr} ${level.name} practice set with id "${setId}".

Parts required:
${describeParts(level[section])}

Rules:
- Question ids must be "${setId}-${section[0]}<part>-<n>", unique across the section.
- ${section === "listening" ? "Every group needs an audio script with an id like \"l<part>-<n>\". Write natural spoken English with contractions and hesitations where suitable. Monologues use one speaker. Add \"voices\" mapping every speaker name to \"female\" or \"male\"." : "Use \"passage\" for a single long text, \"texts\" (keys A-D or A-H) for multiple short texts, and \"group.text\" for a short text with its own questions. Mark gaps in a passage as [1], [2] and so on."}
- "select" questions answer with a key from the part's selectOptions. For true/false use keys "True" and "False".
- Return {"parts": [ ...4 parts ]}.

Here is the B2 ${section} section from another set, as a format example only. Match the structure, not the content or the level:
${JSON.stringify(formatExample()[section])}
${feedback}`;

    const { parts } = await generateJson(client, sectionSchema, INSTRUCTIONS, prompt);
    const errors = validateSection(section, parts, level);
    if (errors.length === 0) return parts;
    feedback = `\nYour previous attempt had these problems. Fix all of them:\n${errors.join("\n")}`;
  }
  throw new Error(`Could not write a valid ${section} section. Please try again.`);
}

async function generateWriting(client: OpenAI, level: LevelSpec) {
  const prompt = `Write the two writing tasks of a ${level.cefr} ${level.name} practice set.

${level.writing.map((task) => `Task ${task.task} (${task.register}): ${task.focus}. ${task.minWords} to ${task.maxWords} words.`).join("\n")}

Each task needs "instructions" (situation, reader, bullet points to cover with "•", and the word range) and, where the task responds to a text, an "input" with that text.
Return {"writing": [task1, task2]}.

Format example from a B2 set:
${JSON.stringify(formatExample().writing)}`;
  const { writing } = await generateJson(client, writingSchema, INSTRUCTIONS, prompt);
  return writing;
}

function nextSetId(levelId: string): string {
  const highest = Math.max(0, ...setFiles(levelId).map((file) => setNumber(path.basename(file, ".json"))));
  return `${levelId}-set-${highest + 1}`;
}

export type SectionName = "listening" | "reading" | "writing";

/** Writes a new practice set to the data directory and returns it. */
export async function generateSet(
  client: OpenAI,
  level: LevelSpec,
  onSectionDone: (section: SectionName) => void = () => {},
): Promise<PracticeSet> {
  const setId = nextSetId(level.id);
  const track = <T>(section: SectionName, work: Promise<T>) =>
    work.then((result) => {
      onSectionDone(section);
      return result;
    });

  const [listening, reading, writing] = await Promise.all([
    track("listening", generateSection(client, "listening", level, setId)),
    track("reading", generateSection(client, "reading", level, setId)),
    track("writing", generateWriting(client, level)),
  ]);
  const set = practiceSetSchema.parse({
    id: setId,
    level: level.id,
    title: `${level.cefr} Practice Set ${setNumber(setId)}`,
    listening,
    reading,
    writing,
  });
  const errors = validateAgainstSpec(set, level);
  if (errors.length > 0) throw new Error(errors.join("\n"));

  const dir = generatedSetsDir(level.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${setId}.json`), `${JSON.stringify(set, null, 2)}\n`);
  return set;
}
