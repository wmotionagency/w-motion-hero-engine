import { runArtDirectorDemo } from "../src/wmotion/art-director/demo";
import { acceptArtDirectorOutput, prepareArtDirectorRequest } from "../src/wmotion/art-director/pipeline";
import {
  automotiveDetailingBrief,
  automotiveDetailingPlan,
} from "../src/wmotion/art-director/fixtures/automotive-detailing";

const demo = runArtDirectorDemo();

if (!demo.validation.valid) {
  throw new Error(
    `Fixture should be valid:\n${demo.validation.issues
      .map((issue) => `[${issue.code}] ${issue.message}`)
      .join("\n")}`,
  );
}

if (demo.validation.score < 85) {
  throw new Error(`Fixture quality-gate score too low: ${demo.validation.score}`);
}

const prepared = prepareArtDirectorRequest(automotiveDetailingBrief);
if (!prepared.request.systemPrompt.includes("W Motion Art Director")) {
  throw new Error("Art Director system prompt was not generated.");
}

const accepted = acceptArtDirectorOutput(
  automotiveDetailingBrief,
  automotiveDetailingPlan,
);

if (!accepted.accepted) {
  throw new Error("Valid Art Direction Plan was unexpectedly rejected.");
}

if (accepted.heroSpec.renderer !== "cinematic-25d") {
  throw new Error("Compiled Hero Spec selected the wrong renderer.");
}

if (!accepted.heroSpec.cinematic25d?.layers.length) {
  throw new Error("Compiled Cinematic 2.5D plan has no layers.");
}

const invalidPlan = structuredClone(automotiveDetailingPlan);
invalidPlan.mobileStrategy.compositionChange = "";

const rejected = acceptArtDirectorOutput(
  automotiveDetailingBrief,
  invalidPlan,
);

if (rejected.accepted) {
  throw new Error("Invalid Art Direction Plan should have been rejected.");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      score: demo.validation.score,
      concept: demo.plan.concept.name,
      renderer: accepted.heroSpec.renderer,
      scenes: accepted.heroSpec.scenes.length,
      layers: accepted.heroSpec.cinematic25d?.layers.length ?? 0,
      invalidPlanRejected: true,
    },
    null,
    2,
  ),
);
