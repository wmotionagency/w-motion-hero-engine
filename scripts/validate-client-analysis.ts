import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  clientResearchBundleSchema,
  clientAnalysisSchema,
} from "../src/wmotion/workflow/schemas";
import {
  validateClientResearchBundle,
  validateClientAnalysisAgainstResearch,
  acceptClientAnalysis,
} from "../src/wmotion/workflow/clientAnalysisPipeline";
import { buildCreativeBriefFromAnalysis } from "../src/wmotion/workflow/buildCreativeBrief";
import {
  exampleClientResearch,
  exampleClientAnalysis,
} from "../src/wmotion/workflow/fixtures/example-client";

function readJson(path: string) {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), path), "utf8"),
  ) as unknown;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const researchTemplate = clientResearchBundleSchema.parse(
  readJson("workflows/templates/client-research-bundle.template.json"),
);

const analysisTemplate = clientAnalysisSchema.parse(
  readJson("workflows/templates/client-analysis.template.json"),
);

const templateResearchValidation =
  validateClientResearchBundle(researchTemplate);

assert(
  templateResearchValidation.valid,
  "Client Research Bundle template should be valid.",
);

const fixtureResearchValidation =
  validateClientResearchBundle(exampleClientResearch);

assert(
  fixtureResearchValidation.valid,
  "Example Client Research fixture should be valid.",
);

assert(
  fixtureResearchValidation.score >= 85,
  `Client Research fixture score too low: ${fixtureResearchValidation.score}`,
);

const fixtureAnalysisValidation =
  validateClientAnalysisAgainstResearch(
    exampleClientResearch,
    exampleClientAnalysis,
  );

assert(
  fixtureAnalysisValidation.valid,
  "Example Client Analysis should match research evidence.",
);

assert(
  fixtureAnalysisValidation.score >= 80,
  `Client Analysis score too low: ${fixtureAnalysisValidation.score}`,
);

const accepted = acceptClientAnalysis(
  exampleClientResearch,
  exampleClientAnalysis,
);

assert(accepted.accepted, "Valid Client Analysis should be accepted.");

const brief = buildCreativeBriefFromAnalysis(exampleClientAnalysis);

assert(
  brief.projectId === exampleClientResearch.projectId,
  "Client research pipeline lost projectId.",
);
assert(
  brief.brandName === exampleClientAnalysis.brandName,
  "Client research pipeline changed brand name.",
);
assert(
  brief.conversionGoal === exampleClientAnalysis.conversionGoal,
  "Client research pipeline changed conversion goal.",
);

const invalidResearch = structuredClone(exampleClientResearch);
invalidResearch.facts = invalidResearch.facts.filter(
  (fact) => fact.field !== "brandName",
);

const rejectedResearch =
  validateClientResearchBundle(invalidResearch);

assert(
  !rejectedResearch.valid,
  "Research without brand-name evidence should be rejected.",
);

const conflictingAnalysis = structuredClone(exampleClientAnalysis);
conflictingAnalysis.brandName = "Wrong Brand";

const rejectedAnalysis =
  validateClientAnalysisAgainstResearch(
    exampleClientResearch,
    conflictingAnalysis,
  );

assert(
  !rejectedAnalysis.valid,
  "Client Analysis conflicting with explicit brand evidence should be rejected.",
);

console.log(
  JSON.stringify(
    {
      status: "ok",
      templates: {
        researchBundle: true,
        clientAnalysis: Boolean(analysisTemplate.brandName),
      },
      researchScore: fixtureResearchValidation.score,
      analysisScore: fixtureAnalysisValidation.score,
      creativeBriefGenerated: true,
      missingCriticalEvidenceRejected: true,
      conflictingAnalysisRejected: true,
    },
    null,
    2,
  ),
);
