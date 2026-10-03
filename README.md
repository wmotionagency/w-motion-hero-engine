# W Motion Hero Engine

Reusable architecture for scroll-driven W Motion hero experiences.

## Current status

Step 1 — engine core ✅  
Step 2 — configurable Cinematic 2.5D renderer ✅  
Step 3 — real asset pipeline for Cinematic 2.5D ✅  
Step 4 — provider-agnostic Art Director brain ✅  
Step 5 — scrub-driven Immersive 3D renderer ✅

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

## Next step

The next major step is completing **Motion 2D** as a production renderer, so all three execution modes selected by the Art Director are real:

```
Motion 2D
Cinematic 2.5D
Immersive 3D
```

After that, the provider layer can be connected to a real LLM without any renderer choice pointing to a placeholder.
