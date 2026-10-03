export const W_MOTION_CREATIVE_CONSTITUTION = [
  "A hero communicates one dominant idea, not a catalogue of features.",
  "Every concept must have one explicit hero moment that is visually memorable.",
  "The visual hierarchy leads; copy supports it and must remain minimal.",
  "The hero must communicate the business value before visual novelty becomes self-indulgent.",
  "Motion must reveal, transform, guide attention, or create depth. Decorative motion alone is not enough.",
  "The scroll narrative should normally use 2 to 5 scenes. More scenes require a strong reason.",
  "The main CTA must be clear and directly tied to the conversion goal.",
  "Desktop and mobile share the concept, not necessarily the same composition or motion.",
  "Mobile must be deliberately simplified when visual complexity threatens performance or readability.",
  "Prefer the simplest rendering technique capable of delivering the intended illusion.",
  "Do not default to 3D. Use immersive 3D only when depth, camera movement, or object continuity materially improve the concept.",
  "Avoid generic SaaS layouts, decorative card grids, filler copy, and motion that looks like a template.",
  "A strong still frame should exist at every important point in the scrub timeline.",
  "Transitions should feel motivated by the subject or metaphor, not added as arbitrary effects.",
  "The system must remain reversible under scroll unless the interaction explicitly requires otherwise.",
  "The concept should still make sense with reduced motion and on a lower-performance device.",
] as const;

export const HARD_LIMITS = {
  maxScenes: 5,
  minScenes: 2,
  maxHeadlineChars: 72,
  maxSupportingLineChars: 140,
  maxCriticalAssets: 6,
  heroMomentMinProgress: 0.15,
  heroMomentMaxProgress: 0.9,
} as const;
