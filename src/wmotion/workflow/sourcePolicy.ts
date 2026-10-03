export const CLIENT_SOURCE_POLICY = {
  priority: [
    "user-supplied-material",
    "official-website",
    "official-business-profile",
    "official-social",
    "secondary-source",
  ],
  rules: [
    "Prefer the client's official website over third-party summaries.",
    "Use the homepage to understand positioning and primary CTA, but inspect service/product and contact pages before finalizing the analysis.",
    "Use About/Studio/Company pages for brand story and identity claims.",
    "Use service/product pages for the actual offer and service hierarchy.",
    "Use contact/location pages for addresses and location-dependent conversion actions.",
    "Official social profiles may clarify visual identity, current imagery and tone when the website is sparse.",
    "Google Business or another official business profile may clarify location, category and operating identity, but should not override the official website when they conflict.",
    "Third-party directories may be used to discover the canonical website, but important business claims should be verified against first-party sources whenever possible.",
    "Do not infer exact audience demographics, commercial performance, pricing, market position or business goals without evidence.",
    "When a value is inferred rather than explicit, label it as inferred and assign medium or low confidence.",
    "Do not treat visual taste as a factual brand claim. Separate observed visual identity from creative opportunity.",
    "Keep evidence snippets short and paraphrased. The workflow needs provenance, not copied webpages.",
  ],
} as const;

export function clientSourcePolicyText() {
  return [
    "SOURCE PRIORITY:",
    ...CLIENT_SOURCE_POLICY.priority.map(
      (source, index) => `${index + 1}. ${source}`,
    ),
    "",
    "EVIDENCE RULES:",
    ...CLIENT_SOURCE_POLICY.rules.map(
      (rule, index) => `${index + 1}. ${rule}`,
    ),
  ].join("\n");
}
