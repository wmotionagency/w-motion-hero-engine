# W Motion Hero Engine

Reusable architecture for scroll-driven W Motion hero experiences.

## Current status

Step 1 — engine core ✅  
Step 2 — Cinematic 2.5D renderer ✅

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
- placeholders for Motion 2D and Immersive 3D;
- production-configurable Cinematic 2.5D renderer;
- Zod-based Hero Spec;
- GitHub Actions build verification.

## Cinematic 2.5D

The 2.5D renderer is driven by Hero Spec data rather than hard-coded animation.

Supported visual primitives:

- glow
- perspective grid
- ring
- orb
- glass panel
- light beam

Each layer can define:

- depth
- pointer parallax
- keyframes
- x / y
- scale
- rotation
- opacity
- blur
- mobile overrides
- mobile visibility

Example:

```ts
{
  id: "hero-orb",
  kind: "orb",
  depth: 0.62,
  parallax: 24,
  keyframes: [
    { at: 0, x: 28, y: 8, scale: 0.42, opacity: 0.15 },
    { at: 0.58, x: -10, y: -4, scale: 1.18, opacity: 1 },
    { at: 1, x: -36, y: -12, scale: 2.2, opacity: 0 }
  ]
}
```

The renderer interpolates continuously between keyframes using the same global progress value that controls scenes and text.

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

Renderers do **not** know about ScrollTrigger.

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

Step 3 will make Cinematic 2.5D production-ready for real client assets by adding:

- image / transparent subject layers;
- mask and reveal primitives;
- asset loading;
- scene-specific activation;
- richer transitions;
- art-direction presets;
- stronger mobile adaptation.

After that, the system can start accepting art-directed real-world hero concepts rather than abstract demo geometry.
