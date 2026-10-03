import { heroSpecSchema, type HeroSpec } from "@/wmotion/schemas/hero.schema";

export type HeroConversionIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type HeroConversionValidation = {
  valid: boolean;
  score: number;
  issues: HeroConversionIssue[];
};

export function validateHeroConversion(
  input: unknown,
): HeroConversionValidation {
  const parsed = heroSpecSchema.safeParse(input);

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

  const spec = parsed.data;
  const conversion = spec.conversion;

  if (!conversion) {
    return {
      valid: true,
      score: 100,
      issues: [],
    };
  }

  const issues: HeroConversionIssue[] = [];
  let score = 100;

  if (conversion.zoneEnd !== 1) {
    issues.push({
      severity: "error",
      code: "conversion-zone-end",
      message: "Conversion zone must end at progress 1.0.",
    });
    score -= 30;
  }

  if (conversion.zoneStart < 0.7 || conversion.zoneStart > 0.82) {
    issues.push({
      severity: "error",
      code: "conversion-zone-range",
      message: "Conversion zone should reserve roughly the final 20–30% of scroll.",
    });
    score -= 20;
  }

  const finalCues = spec.textTimeline.filter((cue) => cue.final);
  const persistentCta = finalCues.find(
    (cue) =>
      cue.persist &&
      Boolean(cue.ctaLabel?.trim()) &&
      Boolean(cue.ctaHref?.trim()) &&
      cue.from <= conversion.zoneStart + 0.03 &&
      cue.to >= 0.99,
  );

  if (conversion.requiresPersistentCta && !persistentCta) {
    issues.push({
      severity: "error",
      code: "persistent-final-cta",
      message:
        "A persistent, clickable CTA must be visible throughout the final conversion state.",
    });
    score -= 35;
  }

  if (
    persistentCta &&
    !persistentCta.headline?.trim() &&
    !persistentCta.body?.trim()
  ) {
    issues.push({
      severity: "error",
      code: "final-copy-missing",
      message:
        "The final conversion cue must contain a headline or supporting message in addition to the CTA.",
    });
    score -= 20;
  }

  if (persistentCta?.ctaHref?.toLowerCase().startsWith("javascript:")) {
    issues.push({
      severity: "error",
      code: "unsafe-cta-href",
      message: "CTA href must be a normal navigable destination.",
    });
    score -= 30;
  }

  if (!conversion.quietFinalState) {
    issues.push({
      severity: "warning",
      code: "quiet-final-state",
      message:
        "Conversion zone is not marked as a quiet final state; CTA competition may be too high.",
    });
    score -= 8;
  }

  if (spec.renderer === "motion-2d" && conversion.quietFinalState) {
    const activeAtEnd =
      spec.motion2d?.elements.filter((element) => {
        const last = element.keyframes[element.keyframes.length - 1];
        return (last.opacity ?? 1) > 0.65;
      }).length ?? 0;

    if (activeAtEnd > 3) {
      issues.push({
        severity: "warning",
        code: "busy-final-frame",
        message:
          "More than three Motion 2D elements remain strongly visible at progress 1.0.",
      });
      score -= 5;
    }
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    score: Math.max(0, score),
    issues,
  };
}

export function assertValidHeroConversion(spec: HeroSpec) {
  const result = validateHeroConversion(spec);

  if (!result.valid) {
    throw new Error(
      `Hero conversion validation failed:\n${result.issues
        .filter((issue) => issue.severity === "error")
        .map((issue) => `- [${issue.code}] ${issue.message}`)
        .join("\n")}`,
    );
  }

  return result;
}
