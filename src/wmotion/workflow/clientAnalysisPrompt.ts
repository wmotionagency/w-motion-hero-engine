import { clientSourcePolicyText } from "./sourcePolicy";
import type { ClientResearchBundle } from "./schemas";

export function buildClientResearchInstructions(sourceUrl: string) {
  return [
    "You are performing W Motion client research.",
    `Start from: ${sourceUrl}`,
    "",
    clientSourcePolicyText(),
    "",
    "Browse enough first-party pages to understand the business before producing conclusions.",
    "At minimum, inspect the homepage and any clearly relevant service/product, about and contact/location pages that are available.",
    "",
    "Return a ClientResearchBundle matching the repository schema.",
    "Every meaningful business fact must carry provenance.",
    "Mark each fact as explicit or inferred.",
    "Capture the actual CTA destination when it is discoverable.",
    "Resolve contentLanguage and market separately from the source site's language.",
    "Use confidence=high only for directly supported first-party facts.",
    "Do not perform creative direction yet.",
  ].join("\n");
}

export function buildClientAnalysisPrompt(bundle: ClientResearchBundle) {
  return [
    "Convert this evidence bundle into a W Motion Client Analysis.",
    "",
    "Rules:",
    "- Preserve evidence-supported facts.",
    "- If audience, conversionGoal or brandTraits require inference, keep them conservative.",
    "- Resolve contentLanguage from the intended customer-facing market or explicit instruction, not by blindly copying source language.",
    "- Preserve primaryCtaHref when it is known.",
    "- Do not invent pricing, awards, scale, customer counts, performance claims or positioning.",
    "- Separate observed current-site friction from creative opportunity.",
    "- Keep visual opportunities specific to the business.",
    "- Return only a Client Analysis compatible with clientAnalysisSchema.",
    "",
    JSON.stringify(bundle, null, 2),
  ].join("\n");
}
