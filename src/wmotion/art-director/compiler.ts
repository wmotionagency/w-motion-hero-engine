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
  if (asset.role === "background") {
    return { type: "fade" as const, from: 0, to: 0.08, invert: false };
  }
  if (asset.role === "subject") {
    return { type: "wipe-x" as const, from: 0.08, to: 0.26, invert: false };
  }
  if (asset.role === "foreground") {
    return { type: "fade" as const, from: 0.15, to: 0.3, invert: false };
  }
  return { type: "wipe-x" as const, from: 0.42, to: 0.58, invert: false };
}

function assetPath(asset: AssetPlan) {
  if (asset.type !== "image" && asset.type !== "transparent-image") {
    return undefined;
  }

  const bucket =
    asset.sourceStrategy === "client"
      ? "client"
      : asset.sourceStrategy === "designed"
        ? "designed"
        : "generated";

  return `/hero-assets/${bucket}/${asset.id}.webp`;
}

function modelPath(asset: AssetPlan) {
  if (asset.type !== "3d-model") return undefined;

  const bucket =
    asset.sourceStrategy === "client"
      ? "client"
      : asset.sourceStrategy === "designed"
        ? "designed"
        : "generated";

  return `/hero-assets/${bucket}/${asset.id}.glb`;
}

function compileCinematicFallback(plan: ArtDirectionPlan) {
  const fallbackAssets = plan.assets.filter((asset) => asset.type !== "3d-model");

  const assets = fallbackAssets.length
    ? fallbackAssets
    : [
        {
          id: "fallback-subject",
          role: "subject" as const,
          type: "css" as const,
          purpose: "Fallback visual for immersive scene",
          sourceStrategy: "procedural" as const,
          mobileStrategy: "simplify" as const,
          priority: "critical" as const,
        },
      ];

  return {
    preset: plan.artDirection.preset,
    pointerStrength: 0.32,
    layers: assets.map((asset, index) => {
      const src = assetPath(asset);
      const hiddenOnMobile =
        asset.mobileStrategy === "hide" ||
        plan.mobileStrategy.hiddenAssetIds.includes(asset.id);

      return {
        id: `fallback-${asset.id}`,
        kind: kindForAsset(asset),
        role: asset.role,
        depth: layerDepth(asset.role),
        parallax: Math.min(16, layerParallax(asset.role)),
        blendMode:
          asset.role === "effect" || asset.role === "foreground"
            ? ("screen" as const)
            : ("normal" as const),
        ...(src
          ? {
              asset: {
                src,
                alt: "",
                fit:
                  asset.role === "background" || asset.role === "foreground"
                    ? ("cover" as const)
                    : ("contain" as const),
                position: "50% 50%",
                preload: asset.priority === "critical",
              },
            }
          : {}),
        initial: {},
        reveal: revealForAsset(asset),
        keyframes: keyframesForAsset(asset, index),
        mobile: {
          hidden: hiddenOnMobile,
          parallax: asset.role === "subject" ? 5 : 2,
          scaleMultiplier: 0.86,
        },
      };
    }),
  };
}

function compileImmersiveObjects(plan: ArtDirectionPlan) {
  const spatialAssets = plan.assets.filter(
    (asset) =>
      asset.type === "3d-model" ||
      asset.type === "shader" ||
      asset.role === "subject" ||
      asset.role === "effect",
  );

  const sourceAssets = spatialAssets.length
    ? spatialAssets.slice(0, 4)
    : [
        {
          id: "hero-subject",
          role: "subject" as const,
          type: "css" as const,
          purpose: "Procedural 3D hero subject",
          sourceStrategy: "procedural" as const,
          mobileStrategy: "simplify" as const,
          priority: "critical" as const,
        },
      ];

  return sourceAssets.map((asset, index) => {
    const isModel = asset.type === "3d-model";
    const isEffect = asset.role === "effect";
    const modelSrc = modelPath(asset);

    const kind = isModel
      ? ("model" as const)
      : isEffect
        ? ("torus" as const)
        : index % 2 === 0
          ? ("icosahedron" as const)
          : ("sphere" as const);

    const zBase = -index * 3.4;

    return {
      id: asset.id,
      kind,
      role: isEffect ? ("effect" as const) : ("subject" as const),
      ...(modelSrc ? { modelSrc } : {}),
      material: {
        color: isEffect ? "#7ec8ff" : "#4a9dff",
        metalness: isEffect ? 0.55 : 0.72,
        roughness: isEffect ? 0.22 : 0.18,
        emissive: isEffect ? "#1d66d8" : "#0b3d8b",
        emissiveIntensity: isEffect ? 0.9 : 0.22,
        transparent: true,
        opacity: 1,
        wireframe: false,
      },
      keyframes: [
        {
          at: 0,
          position: [1.2 + index * 0.4, 0.1, zBase] as [number, number, number],
          rotation: [0, -0.4, 0] as [number, number, number],
          scale: [0.65, 0.65, 0.65] as [number, number, number],
          opacity: index === 0 ? 0.7 : 0,
        },
        {
          at: 0.35,
          position: [0.35, 0, zBase - 0.4] as [number, number, number],
          rotation: [0.15, 0.45 + index * 0.2, 0.12] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          opacity: index <= 1 ? 1 : 0.15,
        },
        {
          at: 0.62,
          position: [-0.3, 0, zBase - 1.2] as [number, number, number],
          rotation: [0.35, 1.2 + index * 0.35, 0.28] as [number, number, number],
          scale: [1.35, 1.35, 1.35] as [number, number, number],
          opacity: index === 0 ? 0.15 : 0.9,
        },
        {
          at: 1,
          position: [0, 0.05, zBase - 3.2] as [number, number, number],
          rotation: [0.45, 1.8 + index * 0.4, 0.42] as [number, number, number],
          scale: [1.1, 1.1, 1.1] as [number, number, number],
          opacity: index === sourceAssets.length - 1 ? 1 : 0.25,
        },
      ],
      pointerInfluence: isEffect ? 0.06 : 0.14,
      castShadow: false,
      receiveShadow: false,
      mobile: {
        hidden:
          asset.mobileStrategy === "hide" ||
          plan.mobileStrategy.hiddenAssetIds.includes(asset.id),
        scaleMultiplier: 0.78,
      },
    };
  });
}

export function compileArtDirectionPlan(plan: ArtDirectionPlan): HeroSpec {
  assertValidArtDirectionPlan(plan);

  const scenes = plan.scenes.map((scene, index) => ({
    id: scene.id,
    start: scene.from,
    end: scene.to,
    transitionIn:
      index === 0 ? undefined : plan.scenes[index - 1].transitionOut,
    transitionOut: scene.transitionOut,
  }));

  const firstScene = plan.scenes[0];
  const lastScene = plan.scenes[plan.scenes.length - 1];

  const textTimeline = [
    {
      id: "primary-message",
      from: Math.max(0.04, firstScene.from + 0.04),
      to: Math.min(
        firstScene.to,
        Math.max(
          firstScene.from + 0.16,
          plan.concept.heroMomentProgress - 0.08,
        ),
      ),
      eyebrow: plan.copy.eyebrow ?? plan.concept.name,
      headline: plan.copy.headline,
      body: plan.copy.supportingLine,
    },
    ...plan.scenes
      .filter(
        (scene) =>
          scene.textIntent &&
          scene.purpose !== "hook" &&
          scene.purpose !== "conversion",
      )
      .slice(0, 1)
      .map((scene) => ({
        id: `scene-copy-${scene.id}`,
        from: scene.from + (scene.to - scene.from) * 0.2,
        to: scene.from + (scene.to - scene.from) * 0.78,
        headline: scene.textIntent,
      })),
    {
      id: "conversion",
      from: Math.min(
        0.9,
        lastScene.from + (lastScene.to - lastScene.from) * 0.42,
      ),
      to: 0.99,
      ctaLabel: plan.copy.cta,
    },
  ].filter((cue) => cue.to > cue.from);

  const compiled: HeroSpec = {
    id: plan.projectId,
    renderer: plan.renderer.recommended,
    scrollLength: plan.renderer.recommended === "immersive-3d" ? 470 : 420,
    brand: {
      name: plan.brand.name,
    },
    scenes,
    textTimeline,
    performance: {
      highRenderer: plan.renderer.recommended,
      mediumRenderer:
        plan.renderer.recommended === "immersive-3d"
          ? plan.renderer.fallback
          : plan.renderer.recommended,
      lowRenderer: "motion-2d",
    },
    responsive: {
      desktop: {
        scrollLength:
          plan.renderer.recommended === "immersive-3d" ? 470 : 420,
        composition: plan.artDirection.composition,
      },
      tablet: {
        scrollLength:
          plan.renderer.recommended === "immersive-3d" ? 400 : 360,
        composition: plan.artDirection.composition,
      },
      mobile: {
        scrollLength: plan.mobileStrategy.targetScrollLengthVh,
        composition: plan.mobileStrategy.compositionChange,
      },
    },
  };

  if (plan.renderer.recommended === "cinematic-25d") {
    compiled.cinematic25d = compileCinematicFallback(plan);
  }

  if (plan.renderer.recommended === "immersive-3d") {
    compiled.immersive3d = {
      background: "#02050d",
      fog: {
        color: "#02050d",
        near: 7,
        far: 24,
      },
      camera: {
        pointerStrength: 0.18,
        keyframes: [
          {
            at: 0,
            position: [0, 0.4, 8],
            target: [0, 0, 0],
            fov: 48,
          },
          {
            at: Math.max(0.3, plan.concept.heroMomentProgress - 0.2),
            position: [0.45, 0.15, 4.6],
            target: [0, 0, -0.8],
            fov: 45,
          },
          {
            at: plan.concept.heroMomentProgress,
            position: [0, 0.05, 1.5],
            target: [0, 0, -2.2],
            fov: 52,
          },
          {
            at: 1,
            position: [0, 0.35, -6],
            target: [0, 0, -9],
            fov: 42,
          },
        ],
      },
      objects: compileImmersiveObjects(plan),
      lights: [
        {
          id: "ambient",
          type: "ambient",
          color: "#8bbcff",
          intensity: 0.5,
        },
        {
          id: "key",
          type: "directional",
          color: "#ffffff",
          intensity: 3,
          position: [4, 5, 6],
        },
        {
          id: "rim",
          type: "point",
          color: "#287cff",
          intensity: 8,
          position: [-3, 1.5, 2],
        },
      ],
      particles: {
        enabled: true,
        count: 260,
        spread: 15,
        size: 0.025,
        color: "#78bfff",
        opacity: 0.42,
      },
      pixelRatio: {
        high: 1.5,
        medium: 1,
        mobile: 1,
      },
    };

    compiled.cinematic25d = compileCinematicFallback(plan);
  }

  return heroSpecSchema.parse(compiled);
}
