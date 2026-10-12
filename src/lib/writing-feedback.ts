import { z } from "zod";

const criterionSchema = z.object({
  score: z.number().int().min(0).max(3),
  comment: z.string(),
});

export const writingFeedbackSchema = z.object({
  criteria: z.object({
    taskFulfilment: criterionSchema,
    grammar: criterionSchema,
    vocabulary: criterionSchema,
    organisation: criterionSchema,
  }),
  summary: z.string(),
  strengths: z.array(z.string()),
  corrections: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      reason: z.string(),
    }),
  ),
  improvedVersion: z.string(),
});

export type WritingFeedback = z.infer<typeof writingFeedbackSchema> & { total: number };

export const CRITERIA_LABELS: Record<keyof WritingFeedback["criteria"], string> = {
  taskFulfilment: "Task fulfilment",
  grammar: "Accuracy and range of grammar",
  vocabulary: "Accuracy and range of vocabulary",
  organisation: "Organisation",
};

export const writingRequestSchema = z.object({
  level: z.string(),
  cefr: z.string(),
  task: z.number().int(),
  focus: z.string(),
  register: z.enum(["formal", "informal"]),
  minWords: z.number().int(),
  maxWords: z.number().int(),
  instructions: z.string(),
  input: z.string().optional(),
  answer: z.string().min(1).max(10000),
});

export type WritingRequest = z.infer<typeof writingRequestSchema>;

export const WRITING_EXAMINER_INSTRUCTIONS = `You are an experienced LanguageCert International ESOL writing examiner.
Mark the candidate's answer for ONE writing task at the stated CEFR level, using the four official criteria. Each criterion is scored 0 to 3, judged against what is expected at THIS level (not against native-speaker writing):

- taskFulfilment: how far the candidate did what was asked. Every content point covered, correct register and format for the reader, length within the word range.
- grammar: range, appropriacy and accuracy of grammar for the level.
- vocabulary: range, accuracy and appropriacy of vocabulary, including spelling.
- organisation: how coherently ideas are linked (paragraphing, linking words, reference) and punctuation accuracy.

Band meaning for every criterion:
3 = fully meets the level. Errors are minor and do not affect communication.
2 = mostly meets the level. Some errors or gaps but the message is clear.
1 = partly meets the level. Frequent errors, limited range or missing content points.
0 = does not meet the level, or too little language to assess.

If the answer is well under the minimum word count, task fulfilment cannot score above 1. If it is off topic, task fulfilment is 0.

Return JSON with this shape:
{
  "criteria": {
    "taskFulfilment": { "score": 0-3, "comment": "..." },
    "grammar": { "score": 0-3, "comment": "..." },
    "vocabulary": { "score": 0-3, "comment": "..." },
    "organisation": { "score": 0-3, "comment": "..." }
  },
  "summary": "two or three sentences on overall performance and the single most useful thing to improve",
  "strengths": ["..."],
  "corrections": [{ "original": "exact phrase from the answer", "corrected": "...", "reason": "short explanation" }],
  "improvedVersion": "a model rewrite of the candidate's answer at the target level, keeping their ideas, within the word range"
}

Write comments directly to the candidate in plain, encouraging English that a learner at this level can follow. Give up to 8 corrections, most important first.`;

export function buildWritingPrompt(request: WritingRequest, wordCount: number): string {
  return [
    `Level: ${request.cefr} (${request.level})`,
    `Task ${request.task}: ${request.focus}`,
    `Register: ${request.register}`,
    `Word range: ${request.minWords} to ${request.maxWords} words. Candidate wrote ${wordCount} words.`,
    `Task instructions:\n${request.instructions}`,
    request.input ? `Input text given to the candidate:\n${request.input}` : "",
    `Candidate's answer:\n"""\n${request.answer}\n"""`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
