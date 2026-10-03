# W Motion Hero Engine

Reusable architecture for scroll-driven W Motion hero experiences.

## Current status

Step 1 — engine core ✅  
Step 2 — configurable Cinematic 2.5D renderer ✅  
Step 3 — real asset pipeline for Cinematic 2.5D ✅  
Step 4 — provider-agnostic Art Director brain ✅  
Step 5 — scrub-driven Immersive 3D renderer ✅  
Step 6 — production Motion 2D renderer ✅  
Step 7 — W Motion Work Workflow ✅  
Step 8 — evidence-driven Client URL Analysis ✅

## Core capabilities

- normalized global scroll progress `0 → 1`;
- GSAP ScrollTrigger adapter;
- reversible scrub architecture;
- multi-scene `SceneController`;
- per-scene local progress;
- independent text timeline;
- pointer input normalized to `-1 → 1`;
- initial performance profiling;
- desktop/tablet/mobile overrides;
- `prefers-reduced-motion` fallback;
- common renderer contract;
- Zod-based Hero Spec;
- GitHub Actions build verification.

## Cinematic 2.5D

The renderer is driven by Hero Spec data rather than hard-coded timelines.

### CSS primitives

- glow
- perspective grid
- ring
- orb
- glass panel
- light beam

### Real image layers

Image layers now support:

- background assets;
- transparent subjects;
- foreground overlays;
- `cover` / `contain`;
- object position;
- preload + decode;
- mobile-specific asset replacement;
- mobile-specific positioning;
- role-specific sizing.

### Layer animation

Each layer can define:

- depth;
- pointer parallax;
- global keyframes;
- x / y;
- scale;
- rotation;
- opacity;
- blur;
- blend mode;
- mobile overrides.

### Scene activation

Layers can be scoped to:

- named scenes;
- a global progress range;
- both together.

This makes it possible to replace one visual subject with another as the scroll narrative advances.

### Reveal system

Supported reveals:

- fade;
- horizontal wipe;
- vertical wipe;
- circular reveal.

Every reveal is scrubbed and reversible.

### Art direction presets

The Hero Spec can declare:

- `neutral`;
- `luxury-dark`;
- `editorial-light`;
- `product-reveal`;
- `spatial-ui`.

These presets form the first art-direction layer that the future AI director can choose automatically.

## Current demo

The demo now behaves like a small commercial product hero:

```
Scene 1 — ARRIVAL
background appears
subject is revealed

        ↓

Scene 2 — DEPTH SHIFT
subject moves toward camera
foreground atmosphere moves independently
light passes through frame

        ↓

Scene 3 — REVEAL
previous subject exits
new graphic scene activates
headline + CTA resolve
```

The subject, background and foreground are separate assets and remain independent from the text timeline.

## Architecture

```
Hero Spec
   │
   ├── scenes
   ├── text timeline
   ├── visual layers
   │      ├── CSS primitives
   │      └── image assets
   │
   ↓
Hero Controller
   ↓
Cinematic 2.5D Renderer
   ├── keyframe interpolation
   ├── scene visibility
   ├── reveal masks
   ├── pointer parallax
   └── responsive overrides
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## W Motion Art Director

The repository now contains a provider-agnostic creative brain under:

```
src/wmotion/art-director/
```

Its pipeline is:

```
Creative Brief
    ↓
Prompt Package
    ↓
Future LLM Provider
    ↓
Art Direction Plan JSON
    ↓
Schema Validation
    ↓
W Motion Quality Gates
    ↓
Deterministic Compiler
    ↓
Hero Spec
    ↓
Hero Engine
```

The model is never allowed to write renderer code directly.

### Creative Brief

The brief captures:

- business and offer;
- audience;
- conversion goal;
- primary CTA;
- brand traits;
- available visual inputs;
- constraints;
- preferred renderer when relevant;
- desired visual intensity.

### Creative Constitution

The Art Director is constrained by permanent W Motion principles including:

- one dominant idea;
- one explicit hero moment;
- minimal hero copy;
- business relevance before decorative novelty;
- 2–5 scenes;
- deliberate mobile composition;
- performance-aware rendering;
- no automatic preference for 3D;
- strong still frames across the scrub timeline;
- reversible motion by default.

### Renderer policy

The Art Director has explicit rules for choosing between:

- Motion 2D;
- Cinematic 2.5D;
- Immersive 3D.

3D is only justified when true spatial continuity is essential.

### Art Direction Plan

A valid plan contains:

- brand analysis;
- conversion objective;
- visual concept;
- visual metaphor;
- hero moment and its timeline position;
- renderer recommendation and fallback;
- composition, color, typography and motion direction;
- scene plan;
- asset plan;
- minimal copy;
- mobile strategy;
- high / medium / low performance strategy.

### Validation gate

Plans are scored and rejected when they violate hard constraints.

Examples:

- invalid scene count;
- incomplete 0→1 timeline;
- missing CTA;
- missing mobile strategy;
- missing performance fallback;
- excessive critical assets;
- invalid schema;
- unsuitable 3D fallback.

Run:

```bash
npm run validate:art-director
```

The validation fixture currently uses a luxury automotive detailing concept called **Light Reveals Precision**.

### Compiler

After validation, the deterministic compiler converts the approved Art Direction Plan into a valid Hero Spec.

This separation is intentional:

```
AI decides WHAT should happen.
Validator decides WHETHER it is acceptable.
Compiler decides HOW it becomes engine data.
Renderer decides HOW it is drawn.
```

## Immersive 3D

The engine now includes a real Three.js renderer under:

```
src/wmotion/renderers/immersive-3d/
```

The 3D renderer is driven by the same normalized `0 → 1` scrub progress as Cinematic 2.5D.

It supports:

- camera position / target / FOV keyframes;
- reversible camera travel;
- procedural sphere / box / torus / icosahedron subjects;
- GLB / glTF model loading;
- object position / rotation / scale / opacity keyframes;
- scene-specific object visibility;
- ambient, directional and point lights;
- deterministic scroll-driven particles;
- pointer influence on camera and subjects;
- desktop / mobile scale overrides;
- high / medium / mobile pixel-ratio budgets;
- Three.js resource disposal;
- WebGL2 detection with 2.5D fallback.

The renderer does not run an independent cinematic timeline. Every important state is sampled from scroll progress, so moving the page backward reverses the experience.

### 3D demo

Run the project and open:

```
/3d
```

The current demo performs:

```
APPROACH
camera moves toward subject
        ↓
CROSSING
camera passes through a spatial ring
first subject exits
        ↓
PAYOFF
second subject appears
camera settles
headline + CTA resolve
```

The demo also contains a Cinematic 2.5D fallback.

### Art Director → 3D

The Art Director compiler now produces an `immersive3d` Hero Spec when the approved plan requires true spatial continuity.

A valid immersive plan can define 3D-model and shader assets. The compiler generates:

- camera timeline;
- 3D objects;
- lighting;
- particles;
- pixel-ratio strategy;
- Cinematic 2.5D fallback.

An Immersive 3D plan without a lighter fallback is rejected by the quality gate.

## Motion 2D

The engine now includes a production Motion 2D renderer under:

```
src/wmotion/renderers/motion-2d/
```

Motion 2D is driven by the same normalized `0 → 1` progress as the other renderers.

It supports:

- circles, rectangles, panels and lines;
- SVG-like brand marks;
- image elements;
- scrubbed position / scale / rotation / opacity / blur;
- fade, horizontal wipe, vertical wipe and circular reveal;
- scene-specific visibility;
- pointer response;
- desktop / mobile scale and pointer overrides;
- responsive compositions;
- image preload;
- deterministic reverse scrolling.

Motion 2D is also compiled as the universal lightweight fallback for Cinematic 2.5D and Immersive 3D plans.

### 2D demo

Run the project and open:

```
/2d
```

The current demo performs:

```
SIGNAL
brand mark enters
        ↓
MORPH
graphic line + orbiting element lock into the composition
        ↓
RESOLVE
panel and final brand frame appear
headline + CTA resolve
```

### Art Director → Motion 2D

The compiler now produces a `motion2d` Hero Spec for every approved Art Direction Plan.

When Motion 2D is the primary renderer, it uses the asset plan to build graphic elements directly.

When 2.5D or 3D is primary, Motion 2D becomes the low-power / reduced-motion fallback.

Current execution modes:

```
Motion 2D        ✅
Cinematic 2.5D   ✅
Immersive 3D     ✅
```

Rive remains an optional extension point. The schema reserves a Rive element type, but scroll-scrub control of Rive state machines will be added only when a real Rive asset and state-machine contract are introduced.

## Next step

All three renderer choices are now real. The next major step is connecting the provider-agnostic Art Director to a real LLM provider, then adding the upstream workflow:

```
Client URL / business data
        ↓
Business analysis
        ↓
Creative Brief
        ↓
Art Director AI
        ↓
Validated Art Direction Plan
        ↓
Hero Spec
        ↓
W Motion Hero Engine
```


## W Motion Work Workflow

The repository now contains a Work-ready operating layer under:

```
workflows/
```

Main procedure:

```
workflows/create-hero.md
```

Operational rules:

```
workflows/work-constitution.md
```

Visual QA:

```
workflows/visual-qa.md
```

Reference templates:

```
workflows/templates/
```

The intended usage in ChatGPT Work is now:

```
Crea una hero W Motion per:
https://cliente.it
```

Work should then execute:

```
Client URL / brief
        ↓
Client Analysis
        ↓
Creative Brief
        ↓
Art Director
        ↓
Art Direction Plan
        ↓
Validator
        ↓
Compiler
        ↓
Hero Spec
        ↓
Asset plan
        ↓
Hero Engine
        ↓
Visual QA
        ↓
Targeted corrections
        ↓
Final Hero
```

The workflow is intentionally provider-agnostic. GPT-6 Astra or GPT-5.6 Sol can execute it in Work without embedding a model API into the engine.

### Workflow data contracts

Additional Work-facing schemas live in:

```
src/wmotion/workflow/
```

They currently define:

- Client Analysis;
- Client Analysis → Creative Brief mapping;
- Visual QA report.

TypeScript/Zod schemas remain the source of truth. JSON templates are examples only.

### Workflow validation

Run:

```bash
npm run validate:art-director
npm run validate:workflow
npm run build
```

`validate:workflow` verifies:

- all Work JSON templates;
- Client Analysis → Creative Brief;
- Art Direction validation;
- Hero Spec compilation;
- Motion 2D execution path;
- Cinematic 2.5D execution path;
- Immersive 3D execution path;
- Motion 2D fallback;
- 2.5D fallback for immersive 3D;
- mobile strategy presence.

## Next step

The next major step is making the upstream analysis operational inside Work:

```
Client URL
↓
automatic first-party business analysis
↓
Client Analysis
↓
Creative Brief
↓
existing Work Workflow
```

After that, the practical command can be reduced to a single client URL.


## Client URL Analysis

The upstream Work pipeline now starts from a client URL and builds an evidence-backed business analysis before creative direction begins.

Main browsing procedure:

```
workflows/analyze-client-url.md
```

Architecture:

```
Client URL
    ↓
canonical business resolution
    ↓
first-party browsing
    ↓
ClientResearchBundle
    ↓
research quality gate
    ↓
Client Analysis
    ↓
analysis quality gate
    ↓
Creative Brief
    ↓
existing Art Director workflow
```

### Evidence layer

Research data is defined in:

```
src/wmotion/workflow/schemas.ts
```

The research bundle records:

- inspected pages;
- source type;
- page purpose;
- evidence facts;
- explicit vs inferred status;
- confidence;
- rationale;
- unresolved questions.

Work is instructed to prefer:

1. user-supplied material;
2. official website;
3. official business profile;
4. official social profiles;
5. secondary sources only when needed.

Important business claims should remain first-party whenever possible.

### Research quality gate

`validateClientResearchBundle()` checks for:

- official-site coverage;
- sufficient page depth;
- evidence for critical fields;
- high-confidence evidence density;
- excessive inference.

### Client Analysis quality gate

`validateClientAnalysisAgainstResearch()` checks that the final analysis does not drift from explicit evidence.

For example, it rejects a Client Analysis whose brand name conflicts with a directly observed brand name.

### Browser/model independence

The repository still contains no custom scraper and no LLM API.

ChatGPT Work performs the browsing. The repository defines:

- what to inspect;
- how to store evidence;
- what may be inferred;
- how to validate the result.

This keeps the workflow compatible with future browser or model providers.

### Validation

Run:

```bash
npm run validate:client-analysis
npm run validate:art-director
npm run validate:workflow
npm run build
```

The client-analysis validation confirms:

- research template validity;
- official evidence fixture;
- research scoring;
- Client Analysis consistency;
- Client Analysis → Creative Brief;
- missing critical evidence rejection;
- explicit-fact conflict rejection.

## Practical Work command

The intended starting command is now:

```
Crea una hero W Motion per:
https://cliente.it
```

Work has instructions for the complete chain from URL research to final QA.

## Next step

The next useful step is no longer architectural.

Run the **first real end-to-end client test**:

```
real client URL
↓
Client Research
↓
Client Analysis
↓
Creative Brief
↓
Art Director
↓
Hero Spec
↓
actual assets
↓
rendered preview
↓
Visual QA
```

That test should reveal which parts of the system need refinement based on real creative output rather than additional abstract infrastructure.


## First real client test — Halle Milano

The first end-to-end client project lives under:

```
src/wmotion/projects/halle-milano/
```

Preview route:

```
/projects/halle-milano
```

Selected concept:

**Between States**

Renderer:

**Motion 2D**

The concept uses Halle's own cultural dualities as kinetic typography and resolves them into one central HALLE identity before the booking CTA.

This test also exposed and added two reusable engine capabilities:

- Motion 2D typography primitives;
- clickable CTA destinations.

Validate with:

```bash
npm run validate:halle-test
```


## Conversion-first hero rules

The engine now treats conversion as a final state rather than a temporary animation cue.

For commercial Hero Specs:

- `contentLanguage` and `market` travel from Client Analysis to Creative Brief and Art Direction;
- CTA destinations may travel from Client Analysis through the compiler;
- the final 20–25% of the hero is a conversion zone;
- the final cue is persistent and remains visible at progress 1.0;
- the CTA must be actionable;
- the final composition is expected to reduce visual competition;
- a Hero Conversion Validator rejects broken final states;
- the renderer visual world remains hidden until its initial state has been applied, preventing first-load flashes.

The Halle Milano test now uses Italian copy and a persistent **PRENOTA ORA** final state.
