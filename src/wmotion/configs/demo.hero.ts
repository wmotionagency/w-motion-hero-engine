import { heroSpecSchema } from "@/wmotion/schemas/hero.schema";

export const demoHero = heroSpecSchema.parse({
  id: "wmotion-cinematic-25d-demo",
  renderer: "cinematic-25d",
  scrollLength: 420,
  brand: {
    name: "W Motion",
    primary: "#4a9dff",
    background: "#050816",
  },
  scenes: [
    { id: "arrival", start: 0, end: 0.28, transitionOut: "push-in" },
    { id: "depth-shift", start: 0.28, end: 0.62, transitionIn: "push-in", transitionOut: "portal" },
    { id: "reveal", start: 0.62, end: 1, transitionIn: "portal" },
  ],
  textTimeline: [
    {
      id: "intro-copy",
      from: 0.08,
      to: 0.28,
      eyebrow: "Cinematic 2.5D",
      headline: "La profondità segue lo scroll.",
    },
    {
      id: "transition-copy",
      from: 0.40,
      to: 0.58,
      headline: "Una scena diventa la successiva.",
      body: "Layer, prospettiva e parallax restano reversibili.",
    },
    {
      id: "final-copy",
      from: 0.76,
      to: 0.98,
      eyebrow: "W Motion Hero Engine",
      headline: "Non è un video. È una scena viva.",
      ctaLabel: "Renderer 2.5D attivo",
    },
  ],
  cinematic25d: {
    pointerStrength: 0.5,
    layers: [
      {
        id: "ambient-glow",
        kind: "glow",
        depth: 0.08,
        parallax: 5,
        keyframes: [
          { at: 0, x: -10, y: -8, scale: 1.05, opacity: 0.42 },
          { at: 0.52, x: 16, y: 4, scale: 1.45, opacity: 0.7 },
          { at: 1, x: 0, y: -12, scale: 1.15, opacity: 0.34 },
        ],
      },
      {
        id: "perspective-grid",
        kind: "grid",
        depth: 0.15,
        parallax: 8,
        keyframes: [
          { at: 0, x: 0, y: 24, scale: 1.15, opacity: 0.28, rotate: 0 },
          { at: 0.55, x: 0, y: -2, scale: 1.55, opacity: 0.5, rotate: 1 },
          { at: 1, x: 0, y: -26, scale: 2.1, opacity: 0.12, rotate: 2 },
        ],
        mobile: { parallax: 3, scaleMultiplier: 0.82 },
      },
      {
        id: "rear-ring",
        kind: "ring",
        depth: 0.32,
        parallax: 13,
        keyframes: [
          { at: 0, x: -8, y: 0, scale: 0.55, opacity: 0.26, rotate: -12 },
          { at: 0.5, x: 8, y: -2, scale: 1.18, opacity: 0.72, rotate: 18 },
          { at: 1, x: -20, y: -10, scale: 1.8, opacity: 0.12, rotate: 42 },
        ],
      },
      {
        id: "hero-orb",
        kind: "orb",
        depth: 0.62,
        parallax: 24,
        keyframes: [
          { at: 0, x: 28, y: 8, scale: 0.42, opacity: 0.15, rotate: -8 },
          { at: 0.22, x: 12, y: 0, scale: 0.72, opacity: 1, rotate: 0 },
          { at: 0.58, x: -10, y: -4, scale: 1.18, opacity: 1, rotate: 10 },
          { at: 0.72, x: -28, y: -4, scale: 1.85, opacity: 0.2, rotate: 20 },
          { at: 1, x: -36, y: -12, scale: 2.2, opacity: 0, rotate: 28 },
        ],
        mobile: { parallax: 8, scaleMultiplier: 0.78 },
      },
      {
        id: "glass-panel",
        kind: "panel",
        depth: 0.78,
        parallax: 32,
        keyframes: [
          { at: 0, x: -44, y: 12, scale: 0.72, opacity: 0, rotate: -12 },
          { at: 0.38, x: -30, y: 5, scale: 0.86, opacity: 0 },
          { at: 0.58, x: 4, y: 0, scale: 1, opacity: 0.92, rotate: 0 },
          { at: 0.82, x: 22, y: -4, scale: 1.08, opacity: 0.72, rotate: 5 },
          { at: 1, x: 42, y: -10, scale: 1.18, opacity: 0, rotate: 9 },
        ],
        mobile: { hidden: true },
      },
      {
        id: "light-beam",
        kind: "beam",
        depth: 0.92,
        parallax: 42,
        keyframes: [
          { at: 0, x: -58, y: 18, scale: 0.7, opacity: 0 },
          { at: 0.44, x: -44, y: 8, scale: 0.85, opacity: 0 },
          { at: 0.62, x: 0, y: 0, scale: 1, opacity: 0.82, rotate: -8 },
          { at: 0.78, x: 36, y: -8, scale: 1.18, opacity: 0.36, rotate: -8 },
          { at: 1, x: 66, y: -18, scale: 1.3, opacity: 0 },
        ],
        mobile: { hidden: true },
      },
    ],
  },
  performance: {
    highRenderer: "cinematic-25d",
    mediumRenderer: "cinematic-25d",
    lowRenderer: "motion-2d",
  },
  responsive: {
    desktop: { scrollLength: 420, composition: "cinematic-wide" },
    tablet: { scrollLength: 360, composition: "cinematic-centered" },
    mobile: { scrollLength: 300, composition: "cinematic-mobile" },
  },
});
