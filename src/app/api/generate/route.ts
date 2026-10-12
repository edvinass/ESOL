import { z } from "zod";
import { getLevel } from "@/content/levels";
import { getSet } from "@/lib/content";
import { runningJob, startJob } from "@/lib/generation/jobs";

const requestSchema = z.object({ level: z.string(), setId: z.string().optional() });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  const level = parsed.success ? getLevel(parsed.data.level) : undefined;
  if (!parsed.success || !level) {
    return Response.json({ error: "Unknown level." }, { status: 400 });
  }

  const set = parsed.data.setId ? getSet(level.id, parsed.data.setId) : undefined;
  if (parsed.data.setId && !set) {
    return Response.json({ error: "Unknown practice set." }, { status: 404 });
  }

  try {
    return Response.json(startJob(level, set));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not start." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const level = new URL(request.url).searchParams.get("level") ?? "";
  return Response.json(runningJob(level) ?? null);
}
