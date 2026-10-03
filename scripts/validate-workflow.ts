import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { creativeBriefSchema, artDirectionPlanSchema } from "../src/wmotion/art-director/schemas";
import { validateArtDirectionPlan } from "../src/wmotion/art-director/validator";
import { compileArtDirectionPlan } from "../src/wmotion/art-director/compiler";
import {
  automotiveDetailingBrief,
  automotiveDetailingPlan,
} from "../src/wmotion/art-director/fixtures/automotive-detailing";
import {
  immersiveProductBrief,
  immersiveProductPlan,
} from "../src/wmotion/art-director/fixtures/immersive-product";
import {
  motionBrandBrief,
  motionBrandPlan,
} from "../src/wmotion/art-director/fixtures/motion-brand";
import { heroSpecSchema } from "../src/wmotion/schemas/hero.schema";
import { validateHeroConversion } from "../src/wmotion/validation/heroConversionValidator";
import {
  clientAnalysisSchema,
  qaReportSchema,
} from "../src/wmotion/workflow/schemas";
import { buildCreativeBriefFromAnalysis } from "../src/wmotion/workflow/buildCreativeBrief";

function readJson(path: string) {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), path), "utf8"),
  ) as unknown;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const clientAnalysisTemplate = clientAnalysisSchema.parse(
  readJson("workflows/templates/client-analysis.template.json"),
);

const derivedBrief = buildCreativeBriefFromAnalysis(clientAnalysisTemplate);
assert(
  derivedBrief.projectId === clientAnalysisTemplate.projectId,
  "Client Analysis → Creative Brief lost projectId.",
);
assert(
  derivedBrief.conversionGoal === clientAnalysisTemplate.conversionGoal,
  "Client Analysis → Creative Brief changed conversion goal.",
);
assert(
  derivedBrief.primaryCta === clientAnalysisTemplate.primaryCta,
  "Client Analysis → Creative Brief changed primary CTA.",
);

creativeBriefSchema.parse(
  readJson("workflows/templates/creative-brief.template.json"),
);

const planTemplate = artDirectionPlanSchema.parse(
  readJson("workflows/templates/art-direction-plan.template.json"),
);

const templateValidation = validateArtDirectionPlan(planTemplate);
assert(templateValidation.valid, "Art Direction Plan template must pass validation.");
assert(
  templateValidation.score >= 85,
  `Art Direction Plan template score too low: ${templateValidation.score}`,
);

heroSpecSchema.parse(
  readJson("workflows/templates/hero-spec.template.json"),
);

qaReportSchema.parse(
  readJson("workflows/templates/qa-report.template.json"),
);

const fixtures = [
  {
    name: "motion2d",
    brief: motionBrandBrief,
    plan: motionBrandPlan,
    renderer: "motion-2d" as const,
  },
  {
    name: "cinematic25d",
    brief: automotiveDetailingBrief,
    plan: automotiveDetailingPlan,
    renderer: "cinematic-25d" as const,
  },
  {
    name: "immersive3d",
    brief: immersiveProductBrief,
    plan: immersiveProductPlan,
    renderer: "immersive-3d" as const,
  },
];

const results = fixtures.map(({ name, brief, plan, renderer }) => {
  const validation = validateArtDirectionPlan(plan, brief);

  assert(validation.valid, `${name}: Art Direction Plan failed validation.`);
  assert(validation.score >= 85, `${name}: quality score below 85.`);

  const heroSpec = compileArtDirectionPlan(plan);
  heroSpecSchema.parse(heroSpec);

  const conversionValidation = validateHeroConversion(heroSpec);
  assert(
    conversionValidation.valid,
    `${name}: compiled Hero Spec failed conversion validation.`,
  );

  assert(heroSpec.renderer === renderer, `${name}: wrong primary renderer.`);
  assert(heroSpec.scenes.length >= 2, `${name}: missing scenes.`);
  assert(heroSpec.textTimeline.length >= 1, `${name}: missing text timeline.`);
  assert(heroSpec.motion2d?.elements.length, `${name}: missing Motion 2D fallback.`);
  assert(
    heroSpec.responsive.mobile?.scrollLength,
    `${name}: missing mobile scroll strategy.`,
  );
  assert(
    heroSpec.responsive.mobile?.composition,
    `${name}: missing mobile composition strategy.`,
  );

  if (renderer === "cinematic-25d") {
    assert(
      heroSpec.cinematic25d?.layers.length,
      "cinematic25d: missing 2.5D layers.",
    );
  }

  if (renderer === "immersive-3d") {
    assert(
      heroSpec.immersive3d?.objects.length,
      "immersive3d: missing 3D objects.",
    );
    assert(
      heroSpec.immersive3d?.camera.keyframes.length,
      "immersive3d: missing camera timeline.",
    );
    assert(
      heroSpec.cinematic25d?.layers.length,
      "immersive3d: missing Cinematic 2.5D fallback.",
    );
  }

  return {
    name,
    score: validation.score,
    renderer: heroSpec.renderer,
    scenes: heroSpec.scenes.length,
    textCues: heroSpec.textTimeline.length,
    motionFallbackElements: heroSpec.motion2d?.elements.length ?? 0,
    cinematicFallbackLayers: heroSpec.cinematic25d?.layers.length ?? 0,
    immersiveObjects: heroSpec.immersive3d?.objects.length ?? 0,
    mobileScrollLength: heroSpec.responsive.mobile?.scrollLength,
    conversionScore: conversionValidation.score,
  };
});

console.log(
  JSON.stringify(
    {
      status: "ok",
      templates: {
        clientAnalysis: true,
        creativeBrief: true,
        artDirectionPlan: true,
        heroSpec: true,
        qaReport: true,
      },
      clientAnalysisToBrief: true,
      artDirectionTemplateScore: templateValidation.score,
      fixtures: results,
    },
    null,
    2,
  ),
);
