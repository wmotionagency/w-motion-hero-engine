import { runArtDirectorDemo } from "../src/wmotion/art-director/demo";
import { acceptArtDirectorOutput, prepareArtDirectorRequest } from "../src/wmotion/art-director/pipeline";
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
  throw new Error("Compiled Hero Spec selected the wrong 2.5D renderer.");
}

if (!accepted.heroSpec.cinematic25d?.layers.length) {
  throw new Error("Compiled Cinematic 2.5D plan has no layers.");
}

const immersiveAccepted = acceptArtDirectorOutput(
  immersiveProductBrief,
  immersiveProductPlan,
);

if (!immersiveAccepted.accepted) {
  throw new Error("Valid Immersive 3D Art Direction Plan was unexpectedly rejected.");
}

if (immersiveAccepted.heroSpec.renderer !== "immersive-3d") {
  throw new Error("Compiled Hero Spec selected the wrong 3D renderer.");
}

if (!immersiveAccepted.heroSpec.immersive3d?.objects.length) {
  throw new Error("Compiled Immersive 3D plan has no 3D objects.");
}

if (!immersiveAccepted.heroSpec.immersive3d?.camera.keyframes.length) {
  throw new Error("Compiled Immersive 3D plan has no camera timeline.");
}

if (!immersiveAccepted.heroSpec.cinematic25d?.layers.length) {
  throw new Error("Immersive 3D plan is missing its Cinematic 2.5D fallback.");
}

const motionAccepted = acceptArtDirectorOutput(
  motionBrandBrief,
  motionBrandPlan,
);

if (!motionAccepted.accepted) {
  throw new Error("Valid Motion 2D Art Direction Plan was unexpectedly rejected.");
}

if (motionAccepted.heroSpec.renderer !== "motion-2d") {
  throw new Error("Compiled Hero Spec selected the wrong Motion 2D renderer.");
}

if (!motionAccepted.heroSpec.motion2d?.elements.length) {
  throw new Error("Compiled Motion 2D plan has no elements.");
}

if (!accepted.heroSpec.motion2d?.elements.length) {
  throw new Error("Cinematic 2.5D plan is missing its Motion 2D fallback.");
}

if (!immersiveAccepted.heroSpec.motion2d?.elements.length) {
  throw new Error("Immersive 3D plan is missing its Motion 2D fallback.");
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

const invalidPersistentCtaPlan = structuredClone(automotiveDetailingPlan);
invalidPersistentCtaPlan.conversionStrategy.persistentFinalCta = false;

const rejectedPersistentCta = acceptArtDirectorOutput(
  automotiveDetailingBrief,
  invalidPersistentCtaPlan,
);

if (rejectedPersistentCta.accepted) {
  throw new Error("Art Direction Plan without persistent final CTA should be rejected.");
}

const invalid3DPlan = structuredClone(immersiveProductPlan);
invalid3DPlan.renderer.fallback = "immersive-3d";

const rejected3D = acceptArtDirectorOutput(
  immersiveProductBrief,
  invalid3DPlan,
);

if (rejected3D.accepted) {
  throw new Error("Immersive 3D plan without a lighter fallback should be rejected.");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      cinematic25d: {
        score: demo.validation.score,
        concept: demo.plan.concept.name,
        renderer: accepted.heroSpec.renderer,
        scenes: accepted.heroSpec.scenes.length,
        layers: accepted.heroSpec.cinematic25d?.layers.length ?? 0,
      },
      immersive3d: {
        renderer: immersiveAccepted.heroSpec.renderer,
        objects: immersiveAccepted.heroSpec.immersive3d?.objects.length ?? 0,
        cameraKeyframes:
          immersiveAccepted.heroSpec.immersive3d?.camera.keyframes.length ?? 0,
        fallbackLayers:
          immersiveAccepted.heroSpec.cinematic25d?.layers.length ?? 0,
        motionFallbackElements:
          immersiveAccepted.heroSpec.motion2d?.elements.length ?? 0,
      },
      motion2d: {
        renderer: motionAccepted.heroSpec.renderer,
        elements: motionAccepted.heroSpec.motion2d?.elements.length ?? 0,
      },
      invalidPlanRejected: true,
      invalidPersistentCtaRejected: true,
      invalid3DFallbackRejected: true,
    },
    null,
    2,
  ),
);
