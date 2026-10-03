# W Motion Hero Engine

Reusable architecture for scroll-driven W Motion hero experiences.

## Step 1 status

This repository currently contains the **engine core**, not a finished cinematic hero.

Implemented:

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
- placeholders for Motion 2D, Cinematic 2.5D and Immersive 3D;
- simple Cinematic 2.5D demo and debug overlay;
- Zod-based Hero Spec.

## Architecture

```
Browser scroll
   ↓
ScrollTrigger
   ↓
ScrollController
   ↓
HeroController
   ├── SceneController
   ├── InteractionController
   ├── PerformanceManager
   └── Renderer contract
          ├── Motion 2D
          ├── Cinematic 2.5D
          └── Immersive 3D
```

Renderers do **not** know about ScrollTrigger. They receive normalized state from the engine.

## Renderer contract

Every renderer implements:

- `preload()`
- `mount(container)`
- `setProgress(progress)`
- `resize()`
- `destroy()`

Optional inputs:

- `setPointer(pointer)`
- `setSceneState(sceneState)`

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build check

```bash
npm run build
```

## Current demo

The demo contains three scenes:

1. `intro` — 0.00 → 0.33
2. `transition` — 0.33 → 0.66
3. `reveal` — 0.66 → 1.00

The visual is intentionally minimal. Step 2 will build the first production-grade **Cinematic 2.5D renderer**.

## Design principle

The AI/art-direction layer will eventually create a validated Hero Spec. The engine is responsible for rendering that spec predictably and responsively. Creative decisions and runtime implementation stay separated.
