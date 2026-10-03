import { artDirectionPlanSchema, type ArtDirectionPlan, type CreativeBrief } from "./schemas";
import { HARD_LIMITS } from "./constitution";

export type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
};

function wordCount(value?: string) {
  return value?.trim().split(/\s+/).filter(Boolean).length ?? 0;
}

export function validateArtDirectionPlan(
  planInput: unknown,
  brief?: CreativeBrief,
): ValidationResult {
  const parsed = artDirectionPlanSchema.safeParse(planInput);

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

  const plan = parsed.data;
  const issues: ValidationIssue[] = [];
  let score = 100;

  if (plan.scenes.length < HARD_LIMITS.minScenes || plan.scenes.length > HARD_LIMITS.maxScenes) {
    issues.push({
      severity: "error",
      code: "scene-count",
      message: "Hero must contain 2–5 scenes.",
    });
    score -= 30;
  }

  const sorted = [...plan.scenes].sort((a, b) => a.from - b.from);
  if (Math.abs(sorted[0].from) > 0.001 || Math.abs(sorted[sorted.length - 1].to - 1) > 0.001) {
    issues.push({
      severity: "error",
      code: "timeline-coverage",
      message: "Scene timeline must cover progress 0→1.",
    });
    score -= 20;
  }

  for (let index = 1; index < sorted.length; index += 1) {
    if (Math.abs(sorted[index - 1].to - sorted[index].from) > 0.02) {
      issues.push({
        severity: "warning",
        code: "timeline-gap",
        message: `Scene boundary between ${sorted[index - 1].id} and ${sorted[index].id} is discontinuous.`,
      });
      score -= 5;
    }
  }

  if (!plan.concept.heroMoment.trim()) {
    issues.push({
      severity: "error",
      code: "hero-moment",
      message: "One explicit hero moment is required.",
    });
    score -= 30;
  }

  if (
    plan.concept.heroMomentProgress < HARD_LIMITS.heroMomentMinProgress ||
    plan.concept.heroMomentProgress > HARD_LIMITS.heroMomentMaxProgress
  ) {
    issues.push({
      severity: "warning",
      code: "hero-moment-position",
      message: "Hero moment should happen during the main narrative, not at the extreme start/end.",
    });
    score -= 5;
  }

  if (wordCount(plan.copy.headline) > 10) {
    issues.push({
      severity: "warning",
      code: "headline-density",
      message: "Headline is probably too wordy for a visual-first W Motion hero.",
    });
    score -= 6;
  }

  if (wordCount(plan.copy.supportingLine) > 22) {
    issues.push({
      severity: "warning",
      code: "supporting-density",
      message: "Supporting line is too dense for the hero.",
    });
    score -= 5;
  }

  if (!plan.copy.cta.trim() || !plan.objective.primaryCta.trim()) {
    issues.push({
      severity: "error",
      code: "cta-missing",
      message: "A primary CTA is required.",
    });
    score -= 25;
  }

  if (brief && plan.objective.conversionGoal !== brief.conversionGoal) {
    issues.push({
      severity: "warning",
      code: "goal-drift",
      message: "Art direction changed the conversion goal from the supplied brief.",
    });
    score -= 8;
  }

  if (brief && plan.objective.primaryCta !== brief.primaryCta) {
    issues.push({
      severity: "warning",
      code: "cta-drift",
      message: "Art direction changed the requested primary CTA.",
    });
    score -= 5;
  }

  if (!plan.mobileStrategy.compositionChange.trim() || !plan.mobileStrategy.motionSimplification.trim()) {
    issues.push({
      severity: "error",
      code: "mobile-strategy",
      message: "Mobile needs an explicit composition and simplification strategy.",
    });
    score -= 20;
  }

  if (
    !plan.performanceStrategy.high.trim() ||
    !plan.performanceStrategy.medium.trim() ||
    !plan.performanceStrategy.low.trim()
  ) {
    issues.push({
      severity: "error",
      code: "performance-strategy",
      message: "High/medium/low performance strategies are required.",
    });
    score -= 20;
  }

  const criticalAssets = plan.assets.filter((asset) => asset.priority === "critical").length;
  if (criticalAssets > plan.performanceStrategy.maxCriticalAssets) {
    issues.push({
      severity: "error",
      code: "critical-asset-budget",
      message: "Critical asset count exceeds the declared performance budget.",
    });
    score -= 15;
  }

  if (plan.renderer.recommended === "immersive-3d" && plan.renderer.fallback === "immersive-3d") {
    issues.push({
      severity: "warning",
      code: "3d-fallback",
      message: "Immersive 3D should normally provide a lighter fallback renderer.",
    });
    score -= 8;
  }

  if (!plan.assets.some((asset) => asset.role === "subject")) {
    issues.push({
      severity: "warning",
      code: "subject-missing",
      message: "No primary subject asset is defined.",
    });
    score -= 5;
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    score: Math.max(0, score),
    issues,
  };
}

export function assertValidArtDirectionPlan(plan: ArtDirectionPlan, brief?: CreativeBrief) {
  const result = validateArtDirectionPlan(plan, brief);
  if (!result.valid) {
    throw new Error(
      `Art Direction Plan failed validation:\n${result.issues
        .filter((issue) => issue.severity === "error")
        .map((issue) => `- [${issue.code}] ${issue.message}`)
        .join("\n")}`,
    );
  }
  return result;
}
