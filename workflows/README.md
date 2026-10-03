# W Motion Work Workflow

This folder turns the W Motion Hero Engine into a repeatable operating system for ChatGPT Work.

## Intended command

A user should eventually be able to write:

```
Crea una hero W Motion per:
https://cliente.it
```

or:

```
Crea una hero W Motion per questo cliente.

URL:
https://cliente.it

Obiettivo:
prenotazioni
```

Work first follows `analyze-client-url.md`, then continues with `create-hero.md`.

## Workflow

```
Client URL / supplied brief
        ↓
Client Research Bundle
        ↓
Evidence validation
        ↓
Client Analysis validation
        ↓
Creative Brief
        ↓
W Motion Art Director
        ↓
Art Direction Plan
        ↓
Validator
        ↓
Compiler
        ↓
Hero Spec
        ↓
Asset plan / assets
        ↓
Hero Engine
        ↓
Visual QA
        ↓
Targeted corrections
        ↓
Final Hero
```

## Source of truth

Do not treat template JSON files as schemas.

The source of truth is:

- `src/wmotion/workflow/schemas.ts`
- `src/wmotion/art-director/schemas.ts`
- `src/wmotion/schemas/hero.schema.ts`

Templates exist only to show expected structure.

## Model independence

This workflow is intentionally provider-agnostic.

It can be executed by:

- GPT-6 Astra in ChatGPT Work;
- GPT-5.6 Sol in ChatGPT Work;
- a future API-backed model.

The validator, compiler and renderers must not depend on a specific model.

## Local validation

Run:

```bash
npm run validate:client-analysis
npm run validate:art-director
npm run validate:workflow
npm run build
```

All three must pass before a structural workflow change is accepted.


## Persistent final conversion state

Commercial heroes now reserve a final conversion zone, normally starting around 75–80% scroll progress.

The final cue must:

- use the configured `contentLanguage`;
- remain visible at progress 1.0;
- include a clickable CTA destination;
- set `persist: true`;
- set `final: true`;
- sit inside a quieter final composition.

The renderer is also hidden until its initial progress state has been applied, preventing uninitialized typography or visual layers from flashing on first load.

The compiler validates these rules through the Hero Conversion Validator.
