import { z } from "zod";

const sceneSchema = z.object({
  id: z.string().min(1),
  start: z.number().min(0).max(1),
  end: z.number().min(0).max(1),
  transitionIn: z.string().optional(),
  transitionOut: z.string().optional(),
}).refine((scene) => scene.end > scene.start, {
  message: "Scene end must be greater than start.",
});

const textCueSchema = z.object({
  id: z.string().min(1),
  from: z.number().min(0).max(1),
  to: z.number().min(0).max(1),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
}).refine((cue) => cue.to > cue.from, {
  message: "Text cue 'to' must be greater than 'from'.",
});

const responsiveOverrideSchema = z.object({
  scrollLength: z.number().positive().optional(),
  composition: z.string().optional(),
}).optional();

export const heroSpecSchema = z.object({
  id: z.string().min(1),
  renderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]),
  scrollLength: z.number().positive(),
  brand: z.object({
    name: z.string().min(1),
    primary: z.string().optional(),
    background: z.string().optional(),
  }),
  scenes: z.array(sceneSchema).min(1),
  textTimeline: z.array(textCueSchema).default([]),
  performance: z.object({
    highRenderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]).optional(),
    mediumRenderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]).optional(),
    lowRenderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]).optional(),
  }).default({}),
  responsive: z.object({
    desktop: responsiveOverrideSchema,
    tablet: responsiveOverrideSchema,
    mobile: responsiveOverrideSchema,
  }).default({}),
});

export type HeroSpec = z.infer<typeof heroSpecSchema>;
export type HeroTextCue = HeroSpec["textTimeline"][number];
