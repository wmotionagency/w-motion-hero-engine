import { heroSpecSchema } from "@/wmotion/schemas/hero.schema";

export const demo2DHero = heroSpecSchema.parse({
  id: "wmotion-motion-2d-demo",
  renderer: "motion-2d",
  scrollLength: 360,
  brand: {
    name: "W Motion",
    primary: "#4a9dff",
    background: "#050816",
  },
  scenes: [
    { id: "signal", start: 0, end: 0.32, transitionOut: "graphic-lock" },
    { id: "morph", start: 0.32, end: 0.68, transitionIn: "graphic-lock", transitionOut: "brand-resolve" },
    { id: "resolve", start: 0.68, end: 1, transitionIn: "brand-resolve" },
  ],
  textTimeline: [
    {
      id: "intro",
      from: 0.06,
      to: 0.26,
      eyebrow: "Motion 2D",
      headline: "Grafica che reagisce allo scroll.",
    },
    {
      id: "middle",
      from: 0.42,
      to: 0.60,
      headline: "Leggera. Precisa. Reversibile.",
    },
    {
      id: "final",
      from: 0.78,
      to: 0.99,
      eyebrow: "W Motion Hero Engine",
      headline: "Il movimento diventa identità.",
      ctaLabel: "Renderer 2D attivo",
    },
  ],
  motion2d: {
    preset: "brand-motion",
    pointerStrength: 0.2,
    elements: [
      {
        id: "brand-mark",
        kind: "svg-mark",
        role: "subject",
        style: {
          mixBlendMode: "normal",
        },
        reveal: {
          type: "circle",
          from: 0.06,
          to: 0.24,
          invert: false,
        },
        pointerInfluence: 0.16,
        keyframes: [
          { at: 0, x: 110, y: 36, scale: 0.62, rotate: -18, opacity: 0 },
          { at: 0.22, x: 34, y: 10, scale: 0.88, rotate: -6, opacity: 1 },
          { at: 0.52, x: 0, y: 0, scale: 1.08, rotate: 8, opacity: 1 },
          { at: 0.76, x: -42, y: -8, scale: 1.25, rotate: 18, opacity: 0.25 },
          { at: 1, x: -82, y: -14, scale: 1.42, rotate: 28, opacity: 0 },
        ],
        mobile: {
          scaleMultiplier: 0.82,
          pointerInfluence: 0.03,
        },
      },
      {
        id: "accent-line",
        kind: "line",
        role: "effect",
        style: {
          width: "min(72vw, 980px)",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #63b7ff, transparent)",
          borderRadius: "999px",
          mixBlendMode: "screen",
        },
        visibility: {
          scenes: ["morph"],
        },
        reveal: {
          type: "wipe-x",
          from: 0.34,
          to: 0.54,
          invert: false,
        },
        pointerInfluence: 0.04,
        keyframes: [
          { at: 0, x: -150, y: 30, scale: 0.7, opacity: 0 },
          { at: 0.34, x: -90, y: 18, scale: 0.85, opacity: 0.1 },
          { at: 0.52, x: 0, y: 0, scale: 1, opacity: 1 },
          { at: 0.68, x: 100, y: -12, scale: 1.1, opacity: 0.2 },
          { at: 1, x: 150, y: -20, scale: 1.18, opacity: 0 },
        ],
        mobile: {
          scaleMultiplier: 0.9,
          pointerInfluence: 0.01,
        },
      },
      {
        id: "ui-panel",
        kind: "panel",
        role: "background",
        label: "W",
        style: {
          width: "min(62vw, 880px)",
          height: "min(44vh, 460px)",
          background: "rgba(20,55,110,.12)",
          borderColor: "rgba(170,218,255,.18)",
          borderWidth: 1,
          borderRadius: "36px",
          mixBlendMode: "normal",
        },
        reveal: {
          type: "fade",
          from: 0.58,
          to: 0.74,
          invert: false,
        },
        pointerInfluence: 0.03,
        keyframes: [
          { at: 0, x: 0, y: 90, scale: 0.82, opacity: 0 },
          { at: 0.55, x: 0, y: 58, scale: 0.9, opacity: 0 },
          { at: 0.74, x: 0, y: 16, scale: 1, opacity: 0.56 },
          { at: 1, x: 0, y: -6, scale: 1.04, opacity: 0.36 },
        ],
        mobile: {
          scaleMultiplier: 0.86,
          pointerInfluence: 0,
        },
      },
      {
        id: "orbit-circle",
        kind: "circle",
        role: "effect",
        style: {
          width: "220px",
          height: "220px",
          background: "radial-gradient(circle at 35% 30%, #d9f3ff, #4a9dff 32%, rgba(24,69,165,.08) 72%)",
          boxShadow: "0 0 80px rgba(58,139,255,.34)",
          mixBlendMode: "screen",
        },
        visibility: {
          from: 0.12,
          to: 0.82,
        },
        reveal: {
          type: "fade",
          from: 0.12,
          to: 0.24,
          invert: false,
        },
        pointerInfluence: 0.22,
        keyframes: [
          { at: 0, x: -180, y: 120, scale: 0.45, opacity: 0 },
          { at: 0.28, x: -88, y: 56, scale: 0.7, opacity: 0.8 },
          { at: 0.54, x: 110, y: -44, scale: 0.95, opacity: 0.9 },
          { at: 0.78, x: 180, y: -90, scale: 1.12, opacity: 0.25 },
          { at: 1, x: 220, y: -120, scale: 1.2, opacity: 0 },
        ],
        mobile: {
          scaleMultiplier: 0.72,
          pointerInfluence: 0.04,
        },
      },
    ],
  },
  performance: {
    highRenderer: "motion-2d",
    mediumRenderer: "motion-2d",
    lowRenderer: "motion-2d",
  },
  responsive: {
    desktop: { scrollLength: 360, composition: "graphic-wide" },
    tablet: { scrollLength: 320, composition: "graphic-centered" },
    mobile: { scrollLength: 270, composition: "graphic-mobile" },
  },
});
