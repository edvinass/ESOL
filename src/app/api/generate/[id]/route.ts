import { getJob } from "@/lib/generation/jobs";

export async function GET(_request: Request, ctx: RouteContext<"/api/generate/[id]">) {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return Response.json({ error: "This job is no longer running." }, { status: 404 });
  return Response.json(job);
}
