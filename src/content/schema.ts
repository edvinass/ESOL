import { z } from "zod";

export const LEVEL_IDS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
export const levelIdSchema = z.enum(LEVEL_IDS);
export type LevelId = z.infer<typeof levelIdSchema>;

export const segmentSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
});

export const audioSchema = z.object({
  id: z.string().min(1),
  voices: z.record(z.string(), z.enum(["female", "male"])).optional(),
  segments: z.array(segmentSchema).min(1),
});

const choiceQuestionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("choice"),
  prompt: z.string().optional(),
  options: z.array(z.string().min(1)).length(3),
  answer: z.number().int().min(0).max(2),
  explanation: z.string().optional(),
});

const selectQuestionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("select"),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().optional(),
});

const textQuestionSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("text"),
  prompt: z.string().min(1),
  accepted: z.array(z.string().min(1)).min(1),
  explanation: z.string().optional(),
});

export const questionSchema = z.discriminatedUnion("kind", [
  choiceQuestionSchema,
  selectQuestionSchema,
  textQuestionSchema,
]);

export const groupSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  audio: audioSchema.optional(),
  text: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});

export const partSchema = z.object({
  part: z.number().int().min(1).max(4),
  instructions: z.string().min(1),
  texts: z
    .array(z.object({ key: z.string().min(1), title: z.string().optional(), body: z.string().min(1) }))
    .optional(),
  passage: z.string().optional(),
  selectOptions: z.array(z.object({ key: z.string().min(1), label: z.string().min(1) })).optional(),
  groups: z.array(groupSchema).min(1),
});

export const writingTaskSchema = z.object({
  task: z.number().int().min(1).max(2),
  instructions: z.string().min(1),
  input: z.string().optional(),
  register: z.enum(["formal", "informal"]),
});

export const practiceSetSchema = z.object({
  id: z.string().min(1),
  level: levelIdSchema,
  title: z.string().min(1),
  listening: z.array(partSchema).length(4),
  reading: z.array(partSchema).length(4),
  writing: z.array(writingTaskSchema).length(2),
});

export type Segment = z.infer<typeof segmentSchema>;
export type Audio = z.infer<typeof audioSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Part = z.infer<typeof partSchema>;
export type WritingTask = z.infer<typeof writingTaskSchema>;
export type PracticeSet = z.infer<typeof practiceSetSchema>;

export const SECTIONS = ["listening", "reading", "writing"] as const;
export type Section = (typeof SECTIONS)[number];
