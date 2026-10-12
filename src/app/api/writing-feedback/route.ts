import { generateJson, getClient } from "@/lib/ai";
import { countWords } from "@/lib/scoring";
import {
  buildWritingPrompt,
  WRITING_EXAMINER_INSTRUCTIONS,
  writingFeedbackSchema,
  writingRequestSchema,
  type WritingFeedback,
} from "@/lib/writing-feedback";

export async function POST(request: Request) {
  const client = getClient();
  if (!client) {
    return Response.json(
      { error: "AI feedback is off. Add OPENAI_API_KEY to the server environment." },
      { status: 503 },
    );
  }

  const parsed = writingRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const feedback = await generateJson(
      client,
      writingFeedbackSchema,
      WRITING_EXAMINER_INSTRUCTIONS,
      buildWritingPrompt(parsed.data, countWords(parsed.data.answer)),
    );
    const { taskFulfilment, grammar, vocabulary, organisation } = feedback.criteria;
    const total = taskFulfilment.score + grammar.score + vocabulary.score + organisation.score;
    return Response.json({ ...feedback, total } satisfies WritingFeedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: `Could not get feedback: ${message}` }, { status: 502 });
  }
}
