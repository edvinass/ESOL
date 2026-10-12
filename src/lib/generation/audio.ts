import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegStatic from "ffmpeg-static";
import type OpenAI from "openai";
import type { Audio, PracticeSet } from "../../content/schema";
import { TTS_MODEL } from "../ai";
import { audioDir } from "../storage";

const run = promisify(execFile);
const FFMPEG = ffmpegStatic ?? "ffmpeg";

const FEMALE_VOICES = ["coral", "sage", "shimmer", "nova"];
const MALE_VOICES = ["ash", "onyx", "echo", "verse"];
const FEMALE = /\b(woman|girl|mum|mother|lady|wife|daughter|sister|her)\b/i;
const MALE = /\b(man|boy|dad|father|husband|son|brother|him)\b/i;
const ROLE = /^(man|woman|boy|girl|presenter|speaker|announcer|interviewer|guide|teacher|customer|assistant)\b/i;
const PAUSE_SECONDS = 0.6;
const PARALLEL_CLIPS = 3;

const PACE: Record<string, string> = {
  a1: "slowly and very clearly, with short pauses between phrases, like a friendly teacher talking to a beginner",
  a2: "a little slower than normal and clearly, but still relaxed and natural",
  b1: "at a natural but unhurried pace",
  b2: "at a normal everyday pace",
  c1: "at natural native speed, with the rhythm of real conversation",
  c2: "at natural native speed, with the rhythm, reductions and quick turns of real conversation",
};

function assignVoices(audio: Audio): Map<string, string> {
  const voices = new Map<string, string>();
  let female = 0;
  let male = 0;
  for (const { speaker } of audio.segments) {
    if (voices.has(speaker)) continue;
    const hint = audio.voices?.[speaker];
    const useFemale = hint
      ? hint === "female"
      : FEMALE.test(speaker) || (!MALE.test(speaker) && voices.size % 2 === 0);
    voices.set(speaker, useFemale ? FEMALE_VOICES[female++ % 4] : MALE_VOICES[male++ % 4]);
  }
  return voices;
}

function speakingInstructions(levelId: string, speaker: string, monologue: boolean): string {
  const who = ROLE.test(speaker) ? `the ${speaker.toLowerCase()}` : speaker;
  return [
    monologue
      ? `You are ${who}, giving a talk or broadcast to listeners, engaging and clear like a good radio presenter.`
      : `You are ${who}, chatting with another person in a relaxed, everyday conversation.`,
    "Sound like a real person, not a narrator: warm, natural intonation, varied rhythm, and emotion that fits what you are saying.",
    "Use a standard British English accent.",
    `Speak ${PACE[levelId]}.`,
  ].join(" ");
}

async function renderClip(client: OpenAI, levelId: string, audio: Audio, target: string) {
  const voices = assignVoices(audio);
  const work = mkdtempSync(path.join(tmpdir(), "esol-audio-"));
  try {
    const inputs: string[] = [];
    for (const [index, segment] of audio.segments.entries()) {
      const speech = await client.audio.speech.create({
        model: TTS_MODEL,
        voice: voices.get(segment.speaker)!,
        input: segment.text,
        instructions: speakingInstructions(levelId, segment.speaker, voices.size === 1),
        response_format: "mp3",
      });
      const file = path.join(work, `${index}.mp3`);
      writeFileSync(file, Buffer.from(await speech.arrayBuffer()));
      inputs.push(file);
    }

    const args = ["-y", "-loglevel", "error"];
    inputs.forEach((input, index) => {
      args.push("-i", input);
      if (index < inputs.length - 1) {
        args.push("-f", "lavfi", "-t", String(PAUSE_SECONDS), "-i", "anullsrc=r=24000:cl=mono");
      }
    });
    const streams = inputs.length * 2 - 1;
    const filters = Array.from({ length: streams }, (_, i) => `[${i}:a]aformat=sample_rates=24000:channel_layouts=mono[a${i}]`);
    const labels = Array.from({ length: streams }, (_, i) => `[a${i}]`).join("");
    const partial = `${target}.tmp`;
    args.push("-filter_complex", `${filters.join(";")};${labels}concat=n=${streams}:v=0:a=1[out]`, "-map", "[out]", "-b:a", "96k", "-f", "mp3", partial);
    await run(FFMPEG, args);
    renameSync(partial, target);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** Records every missing listening clip of a set. Reports progress as clips finish. */
export async function generateAudio(
  client: OpenAI,
  set: PracticeSet,
  onProgress: (done: number, total: number) => void = () => {},
  force = false,
): Promise<void> {
  const outDir = audioDir(set.level, set.id);
  mkdirSync(outDir, { recursive: true });
  const clips = set.listening
    .flatMap((part) => part.groups.flatMap((group) => (group.audio ? [group.audio] : [])))
    .map((audio) => ({ audio, target: path.join(outDir, `${audio.id}.mp3`) }));
  const todo = clips.filter((clip) => force || !existsSync(clip.target));

  let done = clips.length - todo.length;
  onProgress(done, clips.length);
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL_CLIPS, queue.length) }, async () => {
      for (let clip = queue.shift(); clip; clip = queue.shift()) {
        await renderClip(client, set.level, clip.audio, clip.target);
        onProgress(++done, clips.length);
      }
    }),
  );
}
