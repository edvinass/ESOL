"use client";

import { useEffect, useRef, useState } from "react";
import type { Audio } from "@/content/schema";
import { PlayIcon, StopIcon } from "./icons";

type Props = {
  audio: Audio;
  src?: string;
  maxPlays: number | null;
  rate?: number;
};

let stopOther: (() => void) | null = null;

function voiceQuality(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (/premium|natural|neural/.test(name)) score += 4;
  if (name.includes("enhanced")) score += 3;
  if (name.includes("google")) score += 2;
  if (voice.lang === "en-GB") score += 1;
  if (/compact|eloquence|novelty|bad news|bells|bubbles|cellos|jester|organ|trinoids|whisper|zarvox|albert|fred|junior|ralph|grandma|grandpa|rocko|shelley/.test(name)) score -= 10;
  return score;
}

function pickVoices(): SpeechSynthesisVoice[] {
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en") && voiceQuality(voice) > -5);
  const british = voices.filter((voice) => voice.lang === "en-GB");
  const pool = british.length >= 2 ? british : voices;
  return [...pool].sort((a, b) => voiceQuality(b) - voiceQuality(a));
}

export function AudioPlayer({ audio, src, maxPlays, rate = 0.95 }: Props) {
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const element = useRef<HTMLAudioElement>(null);
  const cancelled = useRef(false);
  const active = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
      if (!src) speechSynthesis.cancel();
    };
  }, [src]);

  const exhausted = maxPlays !== null && plays >= maxPlays;

  async function speakScript() {
    cancelled.current = false;
    const voices = pickVoices();
    const speakers = [...new Set(audio.segments.map((segment) => segment.speaker))];
    for (const segment of audio.segments) {
      if (cancelled.current) break;
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(segment.text);
        const voice = voices[speakers.indexOf(segment.speaker) % Math.max(voices.length, 1)];
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang ?? "en-GB";
        utterance.rate = rate;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        speechSynthesis.speak(utterance);
      });
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  async function play() {
    if (exhausted || active.current) return;
    stopOther?.();
    stopOther = stop;
    active.current = true;
    setPlays((count) => count + 1);
    setPlaying(true);
    if (src && element.current) {
      element.current.currentTime = 0;
      await element.current.play();
      return;
    }
    await speakScript();
    active.current = false;
    setPlaying(false);
  }

  function stop() {
    if (stopOther === stop) stopOther = null;
    cancelled.current = true;
    active.current = false;
    if (src && element.current) {
      element.current.pause();
    } else {
      speechSynthesis.cancel();
    }
    setPlaying(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-3 pr-5">
      {src && (
        <audio
          ref={element}
          src={src}
          preload="none"
          onEnded={() => {
            active.current = false;
            setPlaying(false);
          }}
        />
      )}
      <button
        type="button"
        onClick={playing ? stop : play}
        disabled={!playing && exhausted}
        aria-label={playing ? "Stop recording" : plays === 0 ? "Play recording" : "Play again"}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-200 focus-visible:outline-none disabled:bg-stone-300 disabled:shadow-none"
      >
        {playing ? <StopIcon /> : <PlayIcon className="ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-800">
          {playing ? "Playing…" : exhausted ? "No plays left" : plays === 0 ? "Play recording" : "Play again"}
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-indigo-100">
          <div className={`h-full rounded-full bg-indigo-500 ${playing ? "w-full animate-pulse" : "w-0"}`} />
        </div>
        {!src && <p className="mt-1 text-xs text-stone-500">Browser voice. Use “Generate natural voices” on the level page for real recordings.</p>}
      </div>
      {maxPlays === null ? (
        <span className="text-xs text-stone-500">Played {plays}×</span>
      ) : (
        <span className="flex items-center gap-1.5" aria-label={`Played ${plays} of ${maxPlays}`}>
          {Array.from({ length: maxPlays }, (_, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < plays ? "bg-stone-300" : "bg-indigo-500"}`} />
          ))}
        </span>
      )}
    </div>
  );
}
