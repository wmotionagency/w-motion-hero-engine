import { compileArtDirectionPlan } from "./compiler";
import { automotiveDetailingBrief, automotiveDetailingPlan } from "./fixtures/automotive-detailing";
import { validateArtDirectionPlan } from "./validator";

export function runArtDirectorDemo() {
  const validation = validateArtDirectionPlan(
    automotiveDetailingPlan,
    automotiveDetailingBrief,
  );

  const heroSpec = compileArtDirectionPlan(automotiveDetailingPlan);

  return {
    brief: automotiveDetailingBrief,
    plan: automotiveDetailingPlan,
    validation,
    heroSpec,
  };
}
