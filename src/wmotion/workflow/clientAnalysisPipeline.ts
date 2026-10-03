import {
  clientAnalysisSchema,
  clientResearchBundleSchema,
  type ClientAnalysis,
  type ClientResearchBundle,
} from "./schemas";

export type ClientAnalysisValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type ClientAnalysisValidationResult = {
  valid: boolean;
  score: number;
  issues: ClientAnalysisValidationIssue[];
};

export type ClientResearchValidationResult =
  | {
      valid: false;
      score: number;
      issues: ClientAnalysisValidationIssue[];
    }
  | {
      valid: boolean;
      score: number;
      issues: ClientAnalysisValidationIssue[];
      bundle: ClientResearchBundle;
    };

const CRITICAL_FIELDS = [
  "brandName",
  "businessType",
  "offer",
  "servicesOrProducts",
  "conversionGoal",
  "primaryCta",
] as const;

function factSupportsField(
  facts: ClientResearchBundle["facts"],
  field: string,
) {
  return facts.some((fact) => fact.field === field);
}

export function validateClientResearchBundle(
  input: unknown,
): ClientResearchValidationResult {
  const parsed = clientResearchBundleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      valid: false,
      score: 0,
      issues: parsed.error.issues.map((issue) => ({
        severity: "error" as const,
        code: "schema",
        message: `${issue.path.join(".")}: ${issue.message}`,
      })),
    };
  }

  const bundle = parsed.data;
  const issues: ClientAnalysisValidationIssue[] = [];
  let score = 100;

  if (!bundle.pages.some((page) => page.sourceType === "official-website")) {
    issues.push({
      severity: "warning",
      code: "official-site-missing",
      message: "Research bundle contains no official website page.",
    });
    score -= 10;
  }

  if (bundle.pages.length < 2) {
    issues.push({
      severity: "warning",
      code: "thin-research",
      message: "Only one source page was inspected.",
    });
    score -= 8;
  }

  for (const field of CRITICAL_FIELDS) {
    if (!factSupportsField(bundle.facts, field)) {
      issues.push({
        severity: field === "conversionGoal" ? "warning" : "error",
        code: "evidence-gap",
        message: `No evidence fact supports critical field: ${field}.`,
      });
      score -= field === "conversionGoal" ? 6 : 15;
    }
  }

  const highConfidence = bundle.facts.filter(
    (fact) => fact.confidence === "high",
  ).length;
  const inferred = bundle.facts.filter(
    (fact) => fact.status === "inferred",
  ).length;

  if (highConfidence < 4) {
    issues.push({
      severity: "warning",
      code: "low-evidence-density",
      message: "Research bundle contains fewer than four high-confidence facts.",
    });
    score -= 8;
  }

  if (inferred > Math.max(3, bundle.facts.length * 0.45)) {
    issues.push({
      severity: "warning",
      code: "inference-heavy",
      message: "Too much of the client analysis would depend on inference.",
    });
    score -= 8;
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    score: Math.max(0, score),
    issues,
    bundle,
  };
}

export function validateClientAnalysisAgainstResearch(
  researchInput: unknown,
  analysisInput: unknown,
): ClientAnalysisValidationResult {
  const researchResult = validateClientResearchBundle(researchInput);

  if (!("bundle" in researchResult)) {
    return {
      valid: false,
      score: researchResult.score,
      issues: researchResult.issues,
    };
  }

  if (!researchResult.valid) {
    return {
      valid: false,
      score: researchResult.score,
      issues: researchResult.issues,
    };
  }

  const researchBundle = researchResult.bundle;
  const parsedAnalysis = clientAnalysisSchema.safeParse(analysisInput);

  if (!parsedAnalysis.success) {
    return {
      valid: false,
      score: 0,
      issues: parsedAnalysis.error.issues.map((issue) => ({
        severity: "error" as const,
        code: "analysis-schema",
        message: `${issue.path.join(".")}: ${issue.message}`,
      })),
    };
  }

  const analysis = parsedAnalysis.data;
  const facts = researchBundle.facts;
  const issues: ClientAnalysisValidationIssue[] = [];
  let score = researchResult.score;

  if (
    researchBundle.canonicalUrl &&
    analysis.sourceUrl !== researchBundle.canonicalUrl
  ) {
    issues.push({
      severity: "warning",
      code: "canonical-url-drift",
      message: "Client Analysis sourceUrl differs from the canonical URL found during research.",
    });
    score -= 3;
  }

  if (!analysis.evidenceNotes.length) {
    issues.push({
      severity: "warning",
      code: "evidence-notes-missing",
      message: "Client Analysis should retain concise evidence notes.",
    });
    score -= 5;
  }

  const explicitBrand = facts.find(
    (fact) => fact.field === "brandName" && fact.status === "explicit",
  );
  if (
    explicitBrand &&
    explicitBrand.value.toLowerCase() !== analysis.brandName.toLowerCase()
  ) {
    issues.push({
      severity: "error",
      code: "brand-name-drift",
      message: "Client Analysis brandName conflicts with explicit source evidence.",
    });
    score -= 25;
  }

  const explicitCta = facts.find(
    (fact) => fact.field === "primaryCta" && fact.status === "explicit",
  );
  if (
    explicitCta &&
    !analysis.primaryCta
      .toLowerCase()
      .includes(explicitCta.value.toLowerCase()) &&
    !explicitCta.value
      .toLowerCase()
      .includes(analysis.primaryCta.toLowerCase())
  ) {
    issues.push({
      severity: "warning",
      code: "cta-drift",
      message: "Primary CTA differs from explicit source evidence.",
    });
    score -= 6;
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    score: Math.max(0, score),
    issues,
  };
}

export function acceptClientAnalysis(
  research: ClientResearchBundle,
  analysis: ClientAnalysis,
) {
  const validation = validateClientAnalysisAgainstResearch(
    research,
    analysis,
  );

  if (!validation.valid) {
    return {
      accepted: false as const,
      validation,
    };
  }

  return {
    accepted: true as const,
    validation,
    analysis: clientAnalysisSchema.parse(analysis),
  };
}
