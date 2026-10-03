import { z } from "zod";

export const rendererChoiceSchema = z.enum([
  "motion-2d",
  "cinematic-25d",
  "immersive-3d",
]);

export const creativeBriefSchema = z.object({
  projectId: z.string().min(1),
  brandName: z.string().min(1),
  contentLanguage: z.string().min(2).default("en"),
  market: z.string().min(2).optional(),
  businessType: z.string().min(2),
  offer: z.string().min(2),
  audience: z.string().min(2),
  conversionGoal: z.string().min(2),
  primaryCta: z.string().min(1),
  primaryCtaHref: z.string().min(1).optional(),
  brandTraits: z.array(z.string().min(1)).min(2).max(6),
  visualInputs: z.array(z.string().min(1)).default([]),
  constraints: z.array(z.string().min(1)).default([]),
  preferredRenderer: rendererChoiceSchema.optional(),
  intensity: z.number().min(1).max(5).default(3),
});

export const brandAnalysisSchema = z.object({
  corePromise: z.string().min(8),
  desiredEmotion: z.string().min(3),
  proofToImply: z.string().min(3),
  visualOpportunity: z.string().min(8),
  visualRisks: z.array(z.string().min(3)).max(5),
  conversionPrinciple: z.string().min(8),
});

export const scenePlanSchema = z.object({
  id: z.string().min(1),
  purpose: z.enum(["hook", "develop", "transition", "payoff", "conversion"]),
  description: z.string().min(8),
  from: z.number().min(0).max(1),
  to: z.number().min(0).max(1),
  subject: z.string().min(2),
  motionIntent: z.string().min(4),
  textIntent: z.string().max(120).optional(),
  transitionOut: z.string().max(80).optional(),
}).refine((scene) => scene.to > scene.from, {
  message: "Scene 'to' must be greater than 'from'.",
});

export const assetPlanSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["background", "subject", "foreground", "effect"]),
  type: z.enum(["image", "transparent-image", "css", "svg", "rive", "3d-model", "shader"]),
  purpose: z.string().min(5),
  sourceStrategy: z.enum(["client", "generated", "designed", "procedural"]),
  generationBrief: z.string().min(8).optional(),
  mobileStrategy: z.enum(["same", "crop", "simplify", "replace", "hide"]),
  priority: z.enum(["critical", "important", "optional"]),
});

export const copyPlanSchema = z.object({
  eyebrow: z.string().max(42).optional(),
  headline: z.string().min(3).max(72),
  supportingLine: z.string().max(140).optional(),
  cta: z.string().min(1).max(36),
});

export const artDirectionPlanSchema = z.object({
  version: z.literal("1.0"),
  projectId: z.string().min(1),
  contentLanguage: z.string().min(2).default("en"),
  market: z.string().min(2).optional(),
  brand: z.object({
    name: z.string().min(1),
    analysis: brandAnalysisSchema,
  }),
  objective: z.object({
    conversionGoal: z.string().min(2),
    primaryCta: z.string().min(1),
    primaryCtaHref: z.string().min(1).optional(),
  }),
  concept: z.object({
    name: z.string().min(2).max(60),
    oneSentenceIdea: z.string().min(12).max(220),
    visualMetaphor: z.string().min(8).max(180),
    heroMoment: z.string().min(8).max(180),
    heroMomentProgress: z.number().min(0.15).max(0.9),
    noveltyReason: z.string().min(8).max(180),
  }),
  renderer: z.object({
    recommended: rendererChoiceSchema,
    reason: z.string().min(8),
    fallback: rendererChoiceSchema,
  }),
  artDirection: z.object({
    preset: z.enum([
      "neutral",
      "luxury-dark",
      "editorial-light",
      "product-reveal",
      "spatial-ui",
    ]),
    composition: z.string().min(6),
    colorDirection: z.string().min(6),
    typographyDirection: z.string().min(6),
    motionLanguage: z.string().min(6),
    depthStrategy: z.string().min(6),
  }),
  scenes: z.array(scenePlanSchema).min(2).max(5),
  assets: z.array(assetPlanSchema).min(1).max(10),
  copy: copyPlanSchema,
  mobileStrategy: z.object({
    compositionChange: z.string().min(8),
    motionSimplification: z.string().min(8),
    hiddenAssetIds: z.array(z.string()).default([]),
    targetScrollLengthVh: z.number().min(180).max(420),
  }),
  performanceStrategy: z.object({
    high: z.string().min(6),
    medium: z.string().min(6),
    low: z.string().min(6),
    maxCriticalAssets: z.number().min(1).max(6),
  }),
  conversionStrategy: z.object({
    zoneStart: z.number().min(0.7).max(0.82).default(0.76),
    persistentFinalCta: z.boolean().default(true),
    quietFinalState: z.boolean().default(true),
  }).default({
    zoneStart: 0.76,
    persistentFinalCta: true,
    quietFinalState: true,
  }),
});

export type CreativeBrief = z.infer<typeof creativeBriefSchema>;
export type BrandAnalysis = z.infer<typeof brandAnalysisSchema>;
export type ArtDirectionPlan = z.infer<typeof artDirectionPlanSchema>;
export type ScenePlan = z.infer<typeof scenePlanSchema>;
export type AssetPlan = z.infer<typeof assetPlanSchema>;
