import { validateArtDirectionPlan } from "../src/wmotion/art-director/validator";
import { compileArtDirectionPlan } from "../src/wmotion/art-director/compiler";
import {
  validateClientResearchBundle,
  validateClientAnalysisAgainstResearch,
} from "../src/wmotion/workflow/clientAnalysisPipeline";
import { heroSpecSchema } from "../src/wmotion/schemas/hero.schema";
import { validateHeroConversion } from "../src/wmotion/validation/heroConversionValidator";
import { halleMilanoResearch } from "../src/wmotion/projects/halle-milano/research";
import { halleMilanoAnalysis } from "../src/wmotion/projects/halle-milano/analysis";
import { halleMilanoBrief } from "../src/wmotion/projects/halle-milano/brief";
import { halleMilanoPlan } from "../src/wmotion/projects/halle-milano/plan";
import { halleMilanoHero } from "../src/wmotion/projects/halle-milano/hero";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const researchValidation = validateClientResearchBundle(halleMilanoResearch);
assert(researchValidation.valid, "Halle research bundle failed validation.");
assert(
  researchValidation.score >= 85,
  `Halle research score too low: ${researchValidation.score}`,
);

const analysisValidation = validateClientAnalysisAgainstResearch(
  halleMilanoResearch,
  halleMilanoAnalysis,
);
assert(analysisValidation.valid, "Halle Client Analysis conflicts with research evidence.");
assert(
  analysisValidation.score >= 80,
  `Halle analysis score too low: ${analysisValidation.score}`,
);

assert(
  halleMilanoBrief.preferredRenderer === "motion-2d",
  "Halle Creative Brief should prefer Motion 2D for this concept.",
);

const planValidation = validateArtDirectionPlan(
  halleMilanoPlan,
  halleMilanoBrief,
);
assert(planValidation.valid, "Halle Art Direction Plan failed validation.");
assert(
  planValidation.score >= 90,
  `Halle Art Direction score too low: ${planValidation.score}`,
);

const compiledBase = compileArtDirectionPlan(halleMilanoPlan);
assert(
  compiledBase.renderer === "motion-2d",
  "Halle compiler selected the wrong renderer.",
);
assert(
  compiledBase.motion2d?.elements.length,
  "Halle compiler produced no Motion 2D elements.",
);

const hero = heroSpecSchema.parse(halleMilanoHero);
assert(hero.renderer === "motion-2d", "Halle preview must use Motion 2D.");
assert(hero.scenes.length === 3, "Halle hero should have exactly three scenes.");
assert(
  hero.motion2d?.elements.some((element) => element.kind === "text"),
  "Halle hero must use the reusable typography primitive.",
);
assert(
  hero.motion2d?.elements.some((element) => element.label === "HALLE"),
  "Halle hero is missing the central HALLE lockup.",
);
assert(hero.contentLanguage === "it", "Halle hero must target Italian.");
assert(hero.market === "IT", "Halle hero must target the Italian market.");

const finalCue = hero.textTimeline.find((cue) => cue.final);
assert(finalCue, "Halle hero must contain a final conversion cue.");
assert(finalCue.persist, "Halle final cue must persist through progress 1.0.");
assert(finalCue.to === 1, "Halle final cue must reach progress 1.0.");
assert(
  finalCue.ctaLabel === "PRENOTA ORA" && Boolean(finalCue.ctaHref),
  "Halle hero must contain a persistent clickable PRENOTA ORA CTA.",
);
assert(
  finalCue.headline === "Questo, quello e tutto ciò che c'è in mezzo.",
  "Halle final headline must be localized in Italian.",
);
assert(
  hero.conversion?.zoneStart === 0.76 &&
    hero.conversion.zoneEnd === 1 &&
    hero.conversion.requiresPersistentCta,
  "Halle hero must reserve the final conversion zone.",
);

const conversionValidation = validateHeroConversion(hero);
assert(
  conversionValidation.valid,
  `Halle conversion validation failed: ${conversionValidation.issues
    .map((issue) => `[${issue.code}] ${issue.message}`)
    .join(", ")}`,
);
assert(
  hero.responsive.mobile?.scrollLength === 270,
  "Halle mobile scroll length does not match the approved strategy.",
);
assert(
  !hero.motion2d?.elements.some((element) => element.kind === "image"),
  "First Halle test should remain self-contained and procedural.",
);

console.log(
  JSON.stringify(
    {
      status: "ok",
      project: "halle-milano",
      researchScore: researchValidation.score,
      analysisScore: analysisValidation.score,
      artDirectionScore: planValidation.score,
      concept: halleMilanoPlan.concept.name,
      heroMomentProgress: halleMilanoPlan.concept.heroMomentProgress,
      renderer: hero.renderer,
      scenes: hero.scenes.length,
      motionElements: hero.motion2d?.elements.length ?? 0,
      typographyPrimitive: true,
      clickableBookingCta: true,
      persistentFinalCta: true,
      contentLanguage: hero.contentLanguage,
      conversionScore: conversionValidation.score,
      mobileScrollLength: hero.responsive.mobile?.scrollLength,
      selfContainedPreview: true,
    },
    null,
    2,
  ),
);
