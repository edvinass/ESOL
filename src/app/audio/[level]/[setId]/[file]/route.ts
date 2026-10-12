import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { LEVEL_IDS } from "@/content/schema";
import { audioDir } from "@/lib/storage";

const SAFE_NAME = /^[a-z0-9-]+$/;

export async function GET(request: Request, ctx: RouteContext<"/audio/[level]/[setId]/[file]">) {
  const { level, setId, file } = await ctx.params;
  const id = file.replace(/\.mp3$/, "");
  if (!(LEVEL_IDS as readonly string[]).includes(level) || !SAFE_NAME.test(setId) || !SAFE_NAME.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  const filePath = path.join(audioDir(level, setId), `${id}.mp3`);
  if (!existsSync(filePath)) return new Response("Not found", { status: 404 });

  const size = statSync(filePath).size;
  const headers = {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  // Safari only plays audio from servers that answer range requests.
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
