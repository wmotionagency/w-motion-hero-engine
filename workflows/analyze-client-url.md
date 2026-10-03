# W Motion — Analyze Client URL

This is the upstream browsing procedure used before the creative workflow.

The goal is not to design the hero. The goal is to build a trustworthy, evidence-backed understanding of the client.

## Input

Minimum input:

```
https://client.example
```

Optional context may include:

- a known conversion objective;
- a specific product/service to prioritize;
- user-supplied brand files;
- an explicit instruction to preserve a visual element.

## Step 1 — Resolve the canonical business

Start from the supplied URL.

If the URL points to:

- Google Maps / Google Business;
- a directory;
- a booking platform;
- a social profile;
- an aggregator;

identify the correct business and locate the official website when possible.

Do not silently switch to a different business with a similar name.

Record:

- requestedUrl;
- canonicalUrl;
- business identity confidence.

## Step 2 — Browse first-party pages

Follow the source policy in:

`src/wmotion/workflow/sourcePolicy.ts`

Inspect enough first-party material to understand the business.

When available, prioritize:

1. homepage;
2. primary service/product pages;
3. about/studio/company page;
4. contact/location page;
5. portfolio/work page when relevant;
6. official business profile;
7. official social profile when visual identity or current work is under-documented on the site.

Do not browse unrelated pages simply to increase source count.

## Step 3 — Build ClientResearchBundle

Create data compatible with:

`clientResearchBundleSchema`

For every page record:

- URL;
- title;
- source type;
- purpose;
- concise notes.

For every fact record:

- field;
- value;
- sourceUrl;
- status = explicit | inferred;
- confidence = high | medium | low;
- rationale.

### Explicit

Use when the source directly supports the fact.

Examples:

- business name in header/footer;
- service listed on a service page;
- location shown on contact page;
- CTA visible on homepage;
- explicit positioning statement.

### Inferred

Use when the source supports a reasonable conclusion but does not state it directly.

Examples:

- likely audience;
- likely conversion goal;
- brand trait derived from repeated visual/tone patterns;
- current-site friction;
- visual opportunity.

Never mark an inferred fact as high confidence.

## Step 4 — Research quality gate

Run the semantic equivalent of:

`validateClientResearchBundle()`

Do not continue if critical explicit facts are missing and can still reasonably be found by browsing.

If the bundle is thin:

- inspect another relevant first-party page;
- look for contact/service/about information;
- clarify canonical website;
- reduce confidence instead of inventing.

## Step 5 — Produce Client Analysis

Use:

`buildClientAnalysisPrompt()`

Convert research evidence into:

`clientAnalysisSchema`

The Client Analysis may synthesize the evidence, but it must not contradict explicit facts.

Keep:

- brandName;
- businessType;
- offer;
- services/products;
- audience;
- conversionGoal;
- primaryCta;
- brandTraits;
- palette;
- visual identity;
- visual opportunities;
- constraints;
- available assets;
- current-site friction;
- preserve list;
- evidenceNotes.

## Step 6 — Client Analysis quality gate

Run the semantic equivalent of:

`validateClientAnalysisAgainstResearch()`

If invalid:

1. inspect the conflict;
2. repair the analysis;
3. do not alter source evidence to make the analysis pass.

Target score: >= 85 when enough source material exists.

## Step 7 — Creative Brief

Only after Client Analysis passes:

```
buildCreativeBriefFromAnalysis()
```

Then continue with:

`workflows/create-hero.md`

## Important boundary

This phase performs research and synthesis only.

Do NOT:

- invent the hero concept;
- choose a renderer;
- decide the hero moment;
- create generated assets;
- start implementation.

Those decisions belong to the Art Director phase.
