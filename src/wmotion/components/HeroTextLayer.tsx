"use client";

import { HeroCTA } from "./HeroCTA";
import type { HeroTextCue } from "@/wmotion/schemas/hero.schema";

function cueVisibility(progress: number, from: number, to: number) {
  if (progress < from || progress > to) return 0;
  const span = to - from;
  const local = (progress - from) / span;
  const fade = Math.min(0.22, span / 2);
  const inEnd = fade / span;
  const outStart = 1 - inEnd;

  if (local < inEnd) return local / Math.max(inEnd, 0.0001);
  if (local > outStart) return (1 - local) / Math.max(1 - outStart, 0.0001);
  return 1;
}

export function HeroTextLayer({
  cues,
  progress,
  reducedMotion,
}: {
  cues: HeroTextCue[];
  progress: number;
  reducedMotion: boolean;
}) {
  return (
    <div className="hero-copy-layer" aria-live="polite">
      {cues.map((cue) => {
        const opacity = reducedMotion ? (progress >= cue.from ? 1 : 0) : cueVisibility(progress, cue.from, cue.to);
        const y = reducedMotion ? 0 : (1 - opacity) * 28;

        return (
          <div
            className="hero-copy"
            key={cue.id}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              pointerEvents: cue.ctaLabel && opacity > 0.75 ? "auto" : "none",
            }}
          >
            {cue.eyebrow ? <small>{cue.eyebrow}</small> : null}
            {cue.headline ? <h1>{cue.headline}</h1> : null}
            {cue.body ? <p>{cue.body}</p> : null}
            {cue.ctaLabel ? <HeroCTA label={cue.ctaLabel} /> : null}
          </div>
        );
      })}
    </div>
  );
}
