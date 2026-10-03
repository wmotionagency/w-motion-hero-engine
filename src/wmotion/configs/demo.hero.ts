import { heroSpecSchema } from "@/wmotion/schemas/hero.schema";

export const demoHero = heroSpecSchema.parse({
  id: "wmotion-core-demo",
  renderer: "cinematic-25d",
  scrollLength: 350,
  brand: {
    name: "W Motion",
    primary: "#4a9dff",
    background: "#050816",
  },
  scenes: [
    {
      id: "intro",
      start: 0,
      end: 0.33,
      transitionOut: "scale-forward",
    },
    {
      id: "transition",
      start: 0.33,
      end: 0.66,
      transitionIn: "scale-forward",
      transitionOut: "reveal-copy",
    },
    {
      id: "reveal",
      start: 0.66,
      end: 1,
      transitionIn: "reveal-copy",
    },
  ],
  textTimeline: [
    {
      id: "reveal-copy",
      from: 0.68,
      to: 0.9,
      eyebrow: "W Motion Hero Engine",
      headline: "Scroll diventa regia.",
      body: "Scene, testi e renderer condividono lo stesso progress 0→1.",
    },
    {
      id: "cta",
      from: 0.86,
      to: 1,
      ctaLabel: "Core pronto",
    },
  ],
  performance: {
    highRenderer: "cinematic-25d",
    mediumRenderer: "cinematic-25d",
    lowRenderer: "motion-2d",
  },
  responsive: {
    desktop: { scrollLength: 350, composition: "centered" },
    tablet: { scrollLength: 320, composition: "centered" },
    mobile: { scrollLength: 300, composition: "bottom-copy" },
  },
});
