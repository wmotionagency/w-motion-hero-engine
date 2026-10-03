import { creativeBriefSchema } from "@/wmotion/art-director/schemas";
import { buildCreativeBriefFromAnalysis } from "@/wmotion/workflow/buildCreativeBrief";
import { halleMilanoAnalysis } from "./analysis";

const baseBrief = buildCreativeBriefFromAnalysis(halleMilanoAnalysis);

export const halleMilanoBrief = creativeBriefSchema.parse({
  ...baseBrief,
  preferredRenderer: "motion-2d",
  intensity: 4,
});
