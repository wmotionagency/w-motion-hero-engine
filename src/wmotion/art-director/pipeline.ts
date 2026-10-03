import { artDirectionPlanSchema, creativeBriefSchema } from "./schemas";
import { buildArtDirectorSystemPrompt, buildArtDirectorUserPrompt } from "./promptBuilder";
import { validateArtDirectionPlan } from "./validator";
import { compileArtDirectionPlan } from "./compiler";

export type ArtDirectorRequest = {
  systemPrompt: string;
  userPrompt: string;
};

export function prepareArtDirectorRequest(briefInput: unknown) {
  const brief = creativeBriefSchema.parse(briefInput);

  const request: ArtDirectorRequest = {
    systemPrompt: buildArtDirectorSystemPrompt(),
    userPrompt: buildArtDirectorUserPrompt(brief),
  };

  return { brief, request };
}

export function acceptArtDirectorOutput(briefInput: unknown, planInput: unknown) {
  const brief = creativeBriefSchema.parse(briefInput);
  const parsedPlan = artDirectionPlanSchema.safeParse(planInput);

  if (!parsedPlan.success) {
    return {
      accepted: false as const,
      validation: {
        valid: false,
        score: 0,
        issues: parsedPlan.error.issues.map((issue) => ({
          severity: "error" as const,
          code: "schema",
          message: `${issue.path.join(".")}: ${issue.message}`,
        })),
      },
    };
  }

  const validation = validateArtDirectionPlan(parsedPlan.data, brief);

  if (!validation.valid) {
    return {
      accepted: false as const,
      plan: parsedPlan.data,
      validation,
    };
  }

  return {
    accepted: true as const,
    plan: parsedPlan.data,
    validation,
    heroSpec: compileArtDirectionPlan(parsedPlan.data),
  };
}
