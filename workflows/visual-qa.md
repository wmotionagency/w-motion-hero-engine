# W Motion Visual QA

Use this checklist after a Hero Spec has been rendered.

## Required viewports

- Desktop: 1440 × 900
- Mobile: 390 × 844
- Tablet: 768 × 1024 when relevant
- Reduced motion state

## Required scrub checkpoints

Inspect:

- 0.00
- 0.25
- 0.50
- 0.75
- 1.00

Additional checkpoints may be added around the hero moment or scene transitions.

## Check every frame for

- visual hierarchy
- subject focus
- composition
- copy readability
- CTA visibility
- transition coherence
- depth
- clipping
- overlap
- visual noise
- excessive empty space
- unintended dead frames
- generic/template-like appearance
- brand specificity
- conversion clarity
- target-language consistency
- renderer initialization flash

## Hero moment check

The hero moment must:

- be immediately identifiable;
- be visually stronger than surrounding frames;
- express the concept rather than only an effect;
- remain understandable on mobile;
- have a viable low-performance interpretation.

## Final conversion-state checks

At progress 1.00 the hero MUST:

- retain a visible headline or supporting message;
- retain a visible CTA;
- keep the CTA clickable;
- use the configured contentLanguage;
- avoid fading the CTA out at the end;
- reduce visual competition around the CTA;
- preserve brand and conversion clarity.

A hero fails QA if the final actionable state disappears before or at 100%.

## Renderer-ready check

On first load, verify that no typography, image layer or primitive appears in an uninitialized state and then disappears/reappears.

Visual worlds should remain hidden until the renderer has applied its initial progress state.

## Mobile-specific checks

Verify:

- crop and subject placement;
- headline size;
- CTA visibility;
- scroll length;
- travel distance;
- pointer dependence;
- layer count;
- hidden assets;
- fallback renderer;
- legibility at intermediate frames.

Mobile may use different keyframes, hidden layers or a different renderer.

## Performance checks

### High

Full intended experience.

### Medium

The concept and hero moment remain intact with reduced technical complexity.

### Low

Brand, value, concept and CTA remain understandable.

A fallback must never produce an empty hero.

## Reduced motion

Verify that:

- content is accessible;
- CTA is available;
- motion is static or minimal;
- the chosen static state is visually intentional.

## Correction policy

Prefer exact parameter changes over regeneration.

Examples:

```
subject x: 120 → 80
headline reveal: 0.82 → 0.74
camera z: 3.2 → 3.8
mobile scale: 1.10 → 0.92
particle count: 260 → 120
```

Regenerate the concept only if the core metaphor, scene structure or renderer choice is wrong.

## Required QA report

Return a report compatible with:

`src/wmotion/workflow/schemas.ts -> qaReportSchema`

Example human summary:

```
W MOTION VISUAL QA

Desktop
0%    PASS
25%   PASS
50%   ISSUE
75%   PASS
100%  PASS

Mobile
0%    PASS
25%   PASS
50%   PASS
75%   ISSUE
100%  PASS

Hero moment             PASS
CTA                     PASS
Responsive composition  PASS
Performance fallback    PASS
Reduced motion          PASS
Content language        PASS
Final conversion state  PASS
```

For every issue include:

- severity;
- exact problem;
- proposed fix;
- exact parameter where possible;
- before / after value where possible.
