import { heroSpecSchema, type HeroSpec } from "@/wmotion/schemas/hero.schema";
import type { ArtDirectionPlan, AssetPlan } from "./schemas";
import { assertValidArtDirectionPlan } from "./validator";

function layerDepth(role: AssetPlan["role"]) {
  if (role === "background") return 0.05;
  if (role === "subject") return 0.62;
  if (role === "foreground") return 0.82;
  return 0.92;
}

function layerParallax(role: AssetPlan["role"]) {
  if (role === "background") return 3;
  if (role === "subject") return 22;
  if (role === "foreground") return 28;
  return 18;
}

function kindForAsset(asset: AssetPlan) {
  if (asset.type === "image" || asset.type === "transparent-image") return "image" as const;
  if (asset.type === "shader") return "glow" as const;
  if (asset.role === "foreground") return "beam" as const;
  if (asset.role === "subject") return "orb" as const;
  return "panel" as const;
}

function keyframesForAsset(asset: AssetPlan, index: number) {
  const offset = index * 8;

  if (asset.role === "background") {
    return [
      { at: 0, x: 0, y: 0, scale: 1.04, opacity: 1 },
      { at: 0.55, x: -6, y: -4, scale: 1.1, opacity: 1 },
      { at: 1, x: 4, y: -10, scale: 1.16, opacity: 0.78 },
    ];
  }

  if (asset.role === "subject") {
    return [
      { at: 0, x: 110 + offset, y: 58, scale: 0.78, opacity: 0 },
      { at: 0.2, x: 48 + offset / 2, y: 24, scale: 0.9, opacity: 1 },
      { at: 0.55, x: 0, y: 0, scale: 1.08, opacity: 1 },
      { at: 0.78, x: -90 - offset, y: -12, scale: 1.36, opacity: 0.25 },
      { at: 1, x: -150 - offset, y: -20, scale: 1.55, opacity: 0 },
    ];
  }

  if (asset.role === "foreground") {
    return [
      { at: 0, x: -28, y: 30, scale: 1.02, opacity: 0 },
      { at: 0.3, x: 0, y: 14, scale: 1.08, opacity: 0.66 },
      { at: 0.7, x: 22, y: -4, scale: 1.15, opacity: 0.46 },
      { at: 1, x: 38, y: -16, scale: 1.22, opacity: 0 },
    ];
  }

  return [
    { at: 0, x: -120, y: 20, scale: 0.82, opacity: 0 },
    { at: 0.42, x: -80, y: 12, scale: 0.9, opacity: 0 },
    { at: 0.58, x: 0, y: 0, scale: 1, opacity: 0.8 },
    { at: 0.78, x: 90, y: -10, scale: 1.12, opacity: 0.25 },
    { at: 1, x: 130, y: -16, scale: 1.2, opacity: 0 },
  ];
}

function revealForAsset(asset: AssetPlan) {
  if (asset.role === "background") return { type: "fade" as const, from: 0, to: 0.08 };
  if (asset.role === "subject") return { type: "wipe-x" as const, from: 0.08, to: 0.26 };
  if (asset.role === "foreground") return { type: "fade" as const, from: 0.15, to: 0.3 };
  return { type: "wipe-x" as const, from: 0.42, to: 0.58 };
}

function assetPath(asset: AssetPlan) {
  if (asset.type === "image" || asset.type === "transparent-image") {
    return `/hero-assets/generated/${asset.id}.webp`;
  }

  return undefined;
}

export function compileArtDirectionPlan(plan: ArtDirectionPlan): HeroSpec {
  assertValidArtDirectionPlan(plan);

  const scenes = plan.scenes.map((scene, index) => ({
    id: scene.id,
    start: scene.from,
    end: scene.to,
    transitionIn: index === 0 ? undefined : plan.scenes[index - 1].transitionOut,
    transitionOut: scene.transitionOut,
  }));

  const firstScene = plan.scenes[0];
  const lastScene = plan.scenes[plan.scenes.length - 1];

  const textTimeline = [
    {
      id: "primary-message",
      from: Math.max(0.04, firstScene.from + 0.04),
      to: Math.min(firstScene.to, Math.max(firstScene.from + 0.16, plan.concept.heroMomentProgress - 0.08)),
      eyebrow: plan.copy.eyebrow ?? plan.concept.name,
      headline: plan.copy.headline,
      body: plan.copy.supportingLine,
    },
    ...plan.scenes
      .filter((scene) => scene.textIntent && scene.purpose !== "hook" && scene.purpose !== "conversion")
      .slice(0, 1)
      .map((scene) => ({
        id: `scene-copy-${scene.id}`,
        from: scene.from + (scene.to - scene.from) * 0.2,
        to: scene.from + (scene.to - scene.from) * 0.78,
        headline: scene.textIntent,
      })),
    {
      id: "conversion",
      from: Math.min(0.9, lastScene.from + (lastScene.to - lastScene.from) * 0.42),
      to: 0.99,
      ctaLabel: plan.copy.cta,
    },
  ].filter((cue) => cue.to > cue.from);

  const compiled: HeroSpec = {
    id: plan.projectId,
    renderer: plan.renderer.recommended,
    scrollLength: 420,
    brand: {
      name: plan.brand.name,
    },
    scenes,
    textTimeline,
    performance: {
      highRenderer: plan.renderer.recommended,
      mediumRenderer:
        plan.renderer.recommended === "immersive-3d" ? plan.renderer.fallback : plan.renderer.recommended,
      lowRenderer: "motion-2d",
    },
    responsive: {
      desktop: {
        scrollLength: 420,
        composition: plan.artDirection.composition,
      },
      tablet: {
        scrollLength: 360,
        composition: plan.artDirection.composition,
      },
      mobile: {
        scrollLength: plan.mobileStrategy.targetScrollLengthVh,
        composition: plan.mobileStrategy.compositionChange,
      },
    },
  };

  if (plan.renderer.recommended === "cinematic-25d") {
    compiled.cinematic25d = {
      preset: plan.artDirection.preset,
      pointerStrength: 0.42,
      layers: plan.assets.map((asset, index) => {
        const src = assetPath(asset);
        const hiddenOnMobile =
          asset.mobileStrategy === "hide" ||
          plan.mobileStrategy.hiddenAssetIds.includes(asset.id);

        return {
          id: asset.id,
          kind: kindForAsset(asset),
          role: asset.role,
          depth: layerDepth(asset.role),
          parallax: layerParallax(asset.role),
          blendMode: asset.role === "effect" || asset.role === "foreground" ? "screen" : "normal",
          ...(src
            ? {
                asset: {
                  src,
                  alt: "",
                  fit: asset.role === "background" || asset.role === "foreground" ? "cover" : "contain",
                  position: "50% 50%",
                  preload: asset.priority === "critical",
                },
              }
            : {}),
          reveal: revealForAsset(asset),
          keyframes: keyframesForAsset(asset, index),
          mobile: {
            hidden: hiddenOnMobile,
            parallax: asset.role === "subject" ? 7 : asset.role === "foreground" ? 4 : 2,
            scaleMultiplier:
              asset.mobileStrategy === "simplify" || asset.mobileStrategy === "crop" ? 0.86 : 1,
          },
        };
      }),
    };
  }

  return heroSpecSchema.parse(compiled);
}
