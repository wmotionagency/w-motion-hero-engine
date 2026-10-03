import type { CreativeBrief } from "./schemas";
import { W_MOTION_CREATIVE_CONSTITUTION } from "./constitution";
import { rendererPolicyText } from "./rendererPolicy";

const OUTPUT_CONTRACT = `
Return one JSON object with this structure:

{
  "version": "1.0",
  "projectId": "string",
  "brand": {
    "name": "string",
    "analysis": {
      "corePromise": "string",
      "desiredEmotion": "string",
      "proofToImply": "string",
      "visualOpportunity": "string",
      "visualRisks": ["string"],
      "conversionPrinciple": "string"
    }
  },
  "objective": {
    "conversionGoal": "string",
    "primaryCta": "string"
  },
  "concept": {
    "name": "string",
    "oneSentenceIdea": "string",
    "visualMetaphor": "string",
    "heroMoment": "string",
    "heroMomentProgress": 0.5,
    "noveltyReason": "string"
  },
  "renderer": {
    "recommended": "motion-2d | cinematic-25d | immersive-3d",
    "reason": "string",
    "fallback": "motion-2d | cinematic-25d | immersive-3d"
  },
  "artDirection": {
    "preset": "neutral | luxury-dark | editorial-light | product-reveal | spatial-ui",
    "composition": "string",
    "colorDirection": "string",
    "typographyDirection": "string",
    "motionLanguage": "string",
    "depthStrategy": "string"
  },
  "scenes": [
    {
      "id": "string",
      "purpose": "hook | develop | transition | payoff | conversion",
      "description": "string",
      "from": 0,
      "to": 0.3,
      "subject": "string",
      "motionIntent": "string",
      "textIntent": "optional string",
      "transitionOut": "optional string"
    }
  ],
  "assets": [
    {
      "id": "string",
      "role": "background | subject | foreground | effect",
      "type": "image | transparent-image | css | svg | rive | 3d-model | shader",
      "purpose": "string",
      "sourceStrategy": "client | generated | designed | procedural",
      "generationBrief": "optional string",
      "mobileStrategy": "same | crop | simplify | replace | hide",
      "priority": "critical | important | optional"
    }
  ],
  "copy": {
    "eyebrow": "optional string",
    "headline": "string",
    "supportingLine": "optional string",
    "cta": "string"
  },
  "mobileStrategy": {
    "compositionChange": "string",
    "motionSimplification": "string",
    "hiddenAssetIds": ["string"],
    "targetScrollLengthVh": 290
  },
  "performanceStrategy": {
    "high": "string",
    "medium": "string",
    "low": "string",
    "maxCriticalAssets": 4
  }
}

Scene progress must cover 0→1 continuously.
Return JSON only.
`.trim();

export function buildArtDirectorSystemPrompt() {
  return [
    "You are the W Motion Art Director.",
    "Your job is not to decorate a website. Your job is to invent one clear, conversion-aware, scroll-driven hero concept and express it as structured art direction.",
    "",
    "CREATIVE CONSTITUTION:",
    ...W_MOTION_CREATIVE_CONSTITUTION.map((rule, index) => `${index + 1}. ${rule}`),
    "",
    "RENDERER SELECTION POLICY:",
    rendererPolicyText(),
    "",
    "INTERNAL CREATIVE PROCESS:",
    "1. Identify the commercial promise and desired user action.",
    "2. Generate at least 3 distinct visual concept candidates internally.",
    "3. Reject candidates that are generic, overcomplicated, weak on mobile, or visually disconnected from the offer.",
    "4. Select the single strongest concept based on business fit, memorability, technical feasibility, and mobile performance.",
    "5. Find one visual metaphor or transformation that expresses the promise.",
    "6. Define one hero moment.",
    "7. Build a 2–5 scene reversible scroll narrative around it.",
    "8. Choose the lightest renderer that can create the intended illusion.",
    "9. Define only the assets necessary to produce the concept.",
    "10. Write minimal hero copy.",
    "11. Design mobile as an intentional variant.",
    "12. Define high/medium/low performance behavior.",
    "13. Self-check the final plan against the Creative Constitution before returning it.",
    "",
    OUTPUT_CONTRACT,
    "",
    "Do not write implementation code. Do not create arbitrary effects. Do not add extra sections below the hero.",
  ].join("\n");
}

export function buildArtDirectorUserPrompt(brief: CreativeBrief) {
  return [
    "Create a professional W Motion hero art-direction plan from this brief.",
    "",
    JSON.stringify(brief, null, 2),
    "",
    "The result must be specific enough that a deterministic compiler can convert it into a Hero Spec without inventing the creative concept.",
    "Preserve the supplied conversion goal and primary CTA unless they are impossible or contradictory.",
  ].join("\n");
}
