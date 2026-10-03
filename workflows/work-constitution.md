# W Motion Work Constitution

This file defines the operational rules that ChatGPT Work must follow when creating a W Motion hero.

## Authority order

1. TypeScript/Zod schemas in `src/wmotion/**` are the source of truth for data shape.
2. The W Motion Creative Constitution defines creative quality.
3. The renderer policy defines technical renderer selection.
4. This Work Constitution defines execution behavior.
5. Workflow templates are examples only and must never override schemas.

## Non-negotiable rules

1. Work may decide the creative direction, but it must not bypass validation.
2. Work must prefer compiler output over custom renderer code.
3. Existing renderers must not be rewritten for a single client unless the required capability is genuinely reusable.
4. Every hero must communicate one dominant idea.
5. Every hero must contain one explicit hero moment.
6. Hero copy must remain minimal and subordinate to the visual hierarchy.
7. A conversion goal and primary CTA are mandatory.
8. Mobile is a deliberate composition, not desktop scaled down.
9. High / medium / low performance behavior must be defined.
10. Immersive 3D may be selected only when true spatial continuity materially improves the concept.
11. Every important scrub checkpoint must work as a still composition.
12. Effects must reveal, transform, guide attention, create depth, or support the brand. Do not add effects to fill space.
13. Do not turn W Motion into a generic template generator.
14. Every hero must be specific to the client's business, offer, audience and desired action.
15. The final hero must be both desirable and immediately understandable.
16. Do not invent business facts that are not present in the source material.
17. Do not hide validator errors or lower quality gates to force acceptance.
18. When QA finds a local issue, patch the smallest relevant parameter first.
19. Regenerate the concept only when the problem is structural.
20. Preserve reversibility of scroll-driven motion unless a documented interaction requires otherwise.
21. Source evidence may not be altered to make a Client Analysis pass validation.
22. Explicit facts and inferred conclusions must remain distinguishable.
23. Work must prefer first-party evidence and preserve the canonical business identity before creative interpretation.

## Separation of responsibilities

```
Work / Art Director
decides WHAT should happen

Validator
decides WHETHER the plan is acceptable

Compiler
decides HOW the plan becomes Hero Spec

Renderer
decides HOW the Hero Spec is drawn

Visual QA
decides WHETHER the rendered result needs correction
```

Work must preserve this separation.
