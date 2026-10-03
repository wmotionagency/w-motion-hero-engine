import { creativeBriefSchema, type CreativeBrief } from "@/wmotion/art-director/schemas";
import { clientAnalysisSchema, type ClientAnalysis } from "./schemas";

export function buildCreativeBriefFromAnalysis(
  analysisInput: ClientAnalysis,
): CreativeBrief {
  const analysis = clientAnalysisSchema.parse(analysisInput);

  return creativeBriefSchema.parse({
    projectId: analysis.projectId,
    brandName: analysis.brandName,
    contentLanguage: analysis.contentLanguage,
    market: analysis.market,
    businessType: analysis.businessType,
    offer: analysis.offer,
    audience: analysis.audience,
    conversionGoal: analysis.conversionGoal,
    primaryCta: analysis.primaryCta,
    brandTraits: analysis.brandTraits,
    visualInputs: [
      ...analysis.visualIdentityNotes,
      ...analysis.visualOpportunities,
      ...analysis.availableAssets,
    ].slice(0, 10),
    constraints: [
      ...analysis.constraints,
      ...analysis.currentSiteFriction.map(
        (item) => `Avoid repeating current-site friction: ${item}`,
      ),
      ...analysis.preserve.map((item) => `Preserve: ${item}`),
    ].slice(0, 12),
    intensity: 3,
  });
}
