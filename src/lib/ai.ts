import OpenAI from "openai";
import type { z } from "zod";

export const TEXT_MODEL = process.env.OPENAI_MODEL ?? "gpt-6.1-sol";
export const TTS_MODEL = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";

export function getClient(): OpenAI | null {
  return process.env.OPENAI_API_KEY ? new OpenAI() : null;
}

/**
 * Asks the model for a JSON object and validates it, retrying once with the
 * validation errors so the model can correct itself.
 */
export async function generateJson<T>(
  client: OpenAI,
  schema: z.ZodType<T>,
  instructions: string,
  input: string,
): Promise<T> {
  let prompt = input;
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.responses.create({
      model: TEXT_MODEL,
      instructions: `${instructions}\n\nRespond with a single JSON object only.`,
      input: `${prompt}\n\nReply with a single JSON object.`,
      text: { format: { type: "json_object" } },
    });

    let json: unknown;
    try {
      json = JSON.parse(response.output_text);
    } catch {
      prompt = `${input}\n\nYour previous reply was not valid JSON. Reply with valid JSON only.`;
      continue;
    }

    const parsed = schema.safeParse(json);
    if (parsed.success) return parsed.data;
    prompt = `${input}\n\nYour previous JSON failed validation:\n${parsed.error.message}\nFix these problems and reply with the full corrected JSON.`;
  }
  throw new Error("The model did not return valid JSON after a retry.");
}
