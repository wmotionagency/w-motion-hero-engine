"use client";

import { HeroCTA } from "./HeroCTA";
import type { HeroTextCue } from "@/wmotion/schemas/hero.schema";

function cueVisibility(
  progress: number,
  from: number,
  to: number,
  persist = false,
) {
  if (progress < from) return 0;

  const span = Math.max(0.0001, to - from);

  if (persist) {
    const fadeDuration = Math.min(0.08, Math.max(0.025, span * 0.24));
    return Math.min(1, (progress - from) / fadeDuration);
  }

  if (progress > to) return 0;

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
        const opacity = reducedMotion
          ? progress >= cue.from
            ? 1
            : 0
          : cueVisibility(progress, cue.from, cue.to, cue.persist);
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
            {cue.ctaLabel ? <HeroCTA label={cue.ctaLabel} href={cue.ctaHref} /> : null}
          </div>
        );
      })}
    </div>
  );
}
