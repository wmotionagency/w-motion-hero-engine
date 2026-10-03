# W Motion — Create Hero Workflow

This is the main operating procedure for ChatGPT Work.

## Input

Minimum acceptable input:

```
Create a W Motion hero for:
https://client.example
```

Optional user context may include:

- conversion objective;
- specific service/product;
- visual references;
- existing logo/assets;
- preferred intensity;
- known technical constraints.

Do not ask for information that can be reasonably recovered from the supplied website or files.

---

# Phase 1 — Client Analysis

When a client URL is supplied, inspect the official website and relevant first-party material.

Extract only evidence-supported information.

Create a Client Analysis compatible with:

`src/wmotion/workflow/schemas.ts -> clientAnalysisSchema`

Capture:

- projectId
- sourceUrl
- brandName
- businessType
- location if relevant
- offer
- services/products
- audience
- conversionGoal
- primaryCta
- brandTraits
- palette
- visualIdentityNotes
- visualOpportunities
- constraints
- availableAssets
- currentSiteFriction
- preserve
- evidenceNotes

Never invent unavailable facts.

---

# Phase 2 — Creative Brief

Convert Client Analysis using the same semantics as:

`buildCreativeBriefFromAnalysis()`

Validate against:

`creativeBriefSchema`

If validation fails, repair the brief before continuing.

---

# Phase 3 — Art Director

Use:

- `src/wmotion/art-director/constitution.ts`
- `src/wmotion/art-director/rendererPolicy.ts`
- `src/wmotion/art-director/promptBuilder.ts`
- the Creative Brief

Think as a professional art director.

Internally consider at least 3 distinct concept directions.

Reject concepts that are:

- generic;
- visually disconnected from the offer;
- too text-heavy;
- technically unjustified;
- weak on mobile;
- expensive without meaningful payoff;
- recognisably template-like;
- dependent on gratuitous 3D.

Select one concept only.

---

# Phase 4 — Hero Moment

Every hero must contain one explicit hero moment.

Examples:

- light sweep reveals bodywork;
- blueprint becomes architecture;
- camera crosses an object;
- graphic system locks into alignment;
- product transforms state;
- subject A resolves into subject B.

The rest of the hero should build toward and resolve from that moment.

---

# Phase 5 — Renderer Selection

Follow `rendererPolicy.ts`.

## Motion 2D

Choose for:

- typography;
- logo/SVG;
- graphic systems;
- UI;
- vector-like motion;
- maximum runtime efficiency.

## Cinematic 2.5D

Choose for:

- photography;
- product/people/automotive;
- layered background/subject/foreground;
- premium reveal;
- parallax;
- simulated camera movement.

This is the preferred default for many visual W Motion heroes.

## Immersive 3D

Choose only when the concept requires:

- real geometry;
- orbit;
- camera continuity;
- moving through objects;
- entering a spatial environment;
- perspective impossible to reproduce convincingly in 2.5D.

Never select 3D only because it appears premium.

---

# Phase 6 — Art Direction Plan

Produce an object compatible with:

`artDirectionPlanSchema`

It must include:

- brand analysis;
- conversion objective;
- concept;
- visual metaphor;
- hero moment;
- hero moment progress;
- renderer and fallback;
- composition;
- color direction;
- typography direction;
- motion language;
- depth strategy;
- scenes;
- assets;
- minimal copy;
- mobile strategy;
- performance strategy.

---

# Phase 7 — Validation Loop

Run:

`validateArtDirectionPlan()`

Do not bypass it.

If `valid === false`:

1. inspect every error;
2. repair the Art Direction Plan;
3. validate again.

If valid but score < 85:

1. inspect warnings;
2. improve the plan;
3. validate again unless a documented constraint prevents improvement.

Target: 90–100.

---

# Phase 8 — Compile

Run:

`compileArtDirectionPlan()`

Do not manually recreate Hero Spec when the compiler already supports the intended concept.

Output a valid Hero Spec.

---

# Phase 9 — Asset Plan

For every required asset define:

- id;
- purpose;
- role;
- visual description;
- source method;
- dimensions/aspect ratio;
- transparency;
- mobile variant;
- output filename/path;
- critical / important / optional.

Prefer the lightest viable technology:

```
CSS
↓
SVG
↓
Rive
↓
WebP / AVIF
↓
GLB
↓
shader/custom solution
```

Use heavier technology only when the illusion requires it.

## AI-generated assets

Define a MASTER ART DIRECTION first.

All generated layers must share:

- lighting;
- camera;
- perspective;
- palette;
- material language;
- atmosphere.

For 2.5D prefer:

```
master scene
↓
background
subject
foreground/effects
```

over unrelated independent generations.

---

# Phase 10 — Build

Integrate Hero Spec into the existing engine.

Do not modify core controllers unless required by a reusable capability.

If a concept needs unsupported behavior:

1. attempt to express it with existing primitives;
2. simplify without losing the hero moment;
3. only then add a new reusable primitive.

Never add client-specific hacks to a renderer if the same result can be represented in data.

---

# Phase 11 — Visual QA

Follow:

`workflows/visual-qa.md`

Required checkpoints:

`0 / 0.25 / 0.50 / 0.75 / 1`

Required viewports:

- 1440 × 900;
- 390 × 844;
- reduced motion;
- tablet where relevant.

Inspect the hero moment and every scene transition.

---

# Phase 12 — Correction Loop

For local issues, patch exact parameters.

Do not regenerate the whole hero by default.

Examples:

```
subject x: 120 → 80
camera target y: 0.4 → 0.15
copy from: 0.82 → 0.74
mobile parallax: 8 → 3
```

Repeat QA after every meaningful correction.

---

# Phase 13 — Final Output

A completed Work run should report:

- Client Analysis completed;
- Creative Brief validated;
- selected concept;
- renderer and fallbacks;
- hero moment;
- scene count;
- asset count;
- validator score;
- Hero Spec generated;
- QA result;
- final build status;
- remaining manual assets or limitations.

Do not proceed to unrelated website sections unless explicitly requested.
