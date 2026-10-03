# W Motion Hero Engine

Reusable architecture for scroll-driven W Motion hero experiences.

## Current status

Step 1 — engine core ✅  
Step 2 — configurable Cinematic 2.5D renderer ✅  
Step 3 — real asset pipeline for Cinematic 2.5D ✅

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

## Next step

The next major step is the **Art Direction layer**.

Instead of manually writing the Hero Spec, the system will start accepting a creative brief and converting it into:

- visual concept;
- hero moment;
- scene sequence;
- recommended renderer;
- asset list;
- layer hierarchy;
- reveal choices;
- mobile simplification;
- initial Hero Spec.

That will be the beginning of the automated W Motion Art Director.
