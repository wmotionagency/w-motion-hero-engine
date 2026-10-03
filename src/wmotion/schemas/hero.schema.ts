import { z } from "zod";

const sceneSchema = z.object({
  id: z.string().min(1),
  start: z.number().min(0).max(1),
  end: z.number().min(0).max(1),
  transitionIn: z.string().optional(),
  transitionOut: z.string().optional(),
}).refine((scene) => scene.end > scene.start, {
  message: "Scene end must be greater than start.",
});

const textCueSchema = z.object({
  id: z.string().min(1),
  from: z.number().min(0).max(1),
  to: z.number().min(0).max(1),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
}).refine((cue) => cue.to > cue.from, {
  message: "Text cue 'to' must be greater than 'from'.",
});

const transformSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  rotate: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  blur: z.number().min(0).optional(),
});

const keyframeSchema = transformSchema.extend({
  at: z.number().min(0).max(1),
});

const assetSchema = z.object({
  src: z.string().min(1),
  alt: z.string().default(""),
  fit: z.enum(["cover", "contain"]).default("contain"),
  position: z.string().default("50% 50%"),
  preload: z.boolean().default(false),
});

const visibilitySchema = z.object({
  scenes: z.array(z.string().min(1)).optional(),
  from: z.number().min(0).max(1).optional(),
  to: z.number().min(0).max(1).optional(),
}).refine((value) => {
  if (value.from === undefined || value.to === undefined) return true;
  return value.to > value.from;
}, {
  message: "Layer visibility 'to' must be greater than 'from'.",
});

const revealSchema = z.object({
  type: z.enum(["none", "fade", "wipe-x", "wipe-y", "circle"]).default("none"),
  from: z.number().min(0).max(1).default(0),
  to: z.number().min(0).max(1).default(1),
  invert: z.boolean().default(false),
}).refine((value) => value.to > value.from, {
  message: "Reveal 'to' must be greater than 'from'.",
});

const cinematicLayerSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "glow",
    "grid",
    "ring",
    "panel",
    "orb",
    "beam",
    "image",
  ]),
  role: z.enum(["background", "subject", "foreground", "effect"]).default("effect"),
  depth: z.number().min(0).max(1).default(0.5),
  parallax: z.number().min(0).max(80).default(0),
  className: z.string().optional(),
  blendMode: z.enum([
    "normal",
    "screen",
    "multiply",
    "overlay",
    "soft-light",
    "lighten",
  ]).default("normal"),
  asset: assetSchema.optional(),
  visibility: visibilitySchema.optional(),
  reveal: revealSchema.optional(),
  initial: transformSchema.default({}),
  keyframes: z.array(keyframeSchema).min(2),
  mobile: z.object({
    hidden: z.boolean().optional(),
    parallax: z.number().min(0).max(80).optional(),
    scaleMultiplier: z.number().positive().optional(),
    assetSrc: z.string().min(1).optional(),
    position: z.string().optional(),
  }).optional(),
}).superRefine((layer, ctx) => {
  if (layer.kind === "image" && !layer.asset) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Image layers require an asset.",
      path: ["asset"],
    });
  }
});


const motion2dStyleSchema = z.object({
  width: z.string().optional(),
  height: z.string().optional(),
  background: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().min(0).max(20).optional(),
  borderRadius: z.string().optional(),
  color: z.string().optional(),
  boxShadow: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  letterSpacing: z.string().optional(),
  lineHeight: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  textTransform: z.enum(["none", "uppercase", "lowercase"]).optional(),
  mixBlendMode: z.enum([
    "normal",
    "screen",
    "multiply",
    "overlay",
    "soft-light",
    "lighten",
  ]).default("normal"),
});

const motion2dElementSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "circle",
    "rect",
    "line",
    "panel",
    "image",
    "svg-mark",
    "text",
    "rive",
  ]),
  role: z.enum(["background", "subject", "foreground", "effect"]).default("subject"),
  asset: assetSchema.optional(),
  riveSrc: z.string().min(1).optional(),
  label: z.string().max(40).optional(),
  style: motion2dStyleSchema.default({
    mixBlendMode: "normal",
  }),
  visibility: visibilitySchema.optional(),
  reveal: revealSchema.optional(),
  pointerInfluence: z.number().min(0).max(1).default(0.08),
  keyframes: z.array(keyframeSchema).min(2),
  mobile: z.object({
    hidden: z.boolean().optional(),
    scaleMultiplier: z.number().positive().optional(),
    assetSrc: z.string().min(1).optional(),
    pointerInfluence: z.number().min(0).max(1).optional(),
  }).optional(),
}).superRefine((element, ctx) => {
  if (element.kind === "image" && !element.asset) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Motion 2D image elements require an asset.",
      path: ["asset"],
    });
  }

  if (element.kind === "rive" && !element.riveSrc) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Motion 2D Rive elements require riveSrc.",
      path: ["riveSrc"],
    });
  }
});

const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

const threeTransformKeyframeSchema = z.object({
  at: z.number().min(0).max(1),
  position: vec3Schema.optional(),
  rotation: vec3Schema.optional(),
  scale: vec3Schema.optional(),
  opacity: z.number().min(0).max(1).optional(),
});

const cameraKeyframeSchema = z.object({
  at: z.number().min(0).max(1),
  position: vec3Schema,
  target: vec3Schema,
  fov: z.number().min(20).max(100).optional(),
});

const threeMaterialSchema = z.object({
  color: z.string().default("#4a9dff"),
  metalness: z.number().min(0).max(1).default(0.35),
  roughness: z.number().min(0).max(1).default(0.28),
  emissive: z.string().default("#000000"),
  emissiveIntensity: z.number().min(0).max(8).default(0),
  transparent: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1),
  wireframe: z.boolean().default(false),
});

const threeObjectSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["sphere", "box", "torus", "icosahedron", "model"]),
  role: z.enum(["subject", "environment", "effect"]).default("subject"),
  modelSrc: z.string().min(1).optional(),
  material: threeMaterialSchema.default({
    color: "#4a9dff",
    metalness: 0.35,
    roughness: 0.28,
    emissive: "#000000",
    emissiveIntensity: 0,
    transparent: false,
    opacity: 1,
    wireframe: false,
  }),
  visibility: visibilitySchema.optional(),
  keyframes: z.array(threeTransformKeyframeSchema).min(2),
  pointerInfluence: z.number().min(0).max(1).default(0.15),
  castShadow: z.boolean().default(false),
  receiveShadow: z.boolean().default(false),
  mobile: z.object({
    hidden: z.boolean().optional(),
    scaleMultiplier: z.number().positive().optional(),
  }).optional(),
}).superRefine((object, ctx) => {
  if (object.kind === "model" && !object.modelSrc) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "3D model objects require modelSrc.",
      path: ["modelSrc"],
    });
  }
});

const threeLightSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["ambient", "directional", "point"]),
  color: z.string().default("#ffffff"),
  intensity: z.number().min(0).max(20).default(1),
  position: vec3Schema.optional(),
});

const threeParticlesSchema = z.object({
  enabled: z.boolean().default(false),
  count: z.number().min(0).max(1200).default(180),
  spread: z.number().min(1).max(30).default(10),
  size: z.number().min(0.005).max(0.2).default(0.025),
  color: z.string().default("#78bfff"),
  opacity: z.number().min(0).max(1).default(0.45),
});

const responsiveOverrideSchema = z.object({
  scrollLength: z.number().positive().optional(),
  composition: z.string().optional(),
}).optional();

export const heroSpecSchema = z.object({
  id: z.string().min(1),
  renderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]),
  scrollLength: z.number().positive(),
  brand: z.object({
    name: z.string().min(1),
    primary: z.string().optional(),
    background: z.string().optional(),
  }),
  scenes: z.array(sceneSchema).min(1),
  textTimeline: z.array(textCueSchema).default([]),
  motion2d: z.object({
    background: z.string().optional(),
    preset: z.enum([
      "graphic-clean",
      "editorial",
      "kinetic-type",
      "product-ui",
      "brand-motion",
    ]).default("graphic-clean"),
    pointerStrength: z.number().min(0).max(1).default(0.2),
    elements: z.array(motion2dElementSchema).min(1),
  }).optional(),
  cinematic25d: z.object({
    preset: z.enum([
      "neutral",
      "luxury-dark",
      "editorial-light",
      "product-reveal",
      "spatial-ui",
    ]).default("neutral"),
    layers: z.array(cinematicLayerSchema).default([]),
    pointerStrength: z.number().min(0).max(1).default(0.45),
  }).optional(),
  immersive3d: z.object({
    background: z.string().default("#02050d"),
    fog: z.object({
      color: z.string().default("#02050d"),
      near: z.number().positive().default(6),
      far: z.number().positive().default(20),
    }).optional(),
    camera: z.object({
      keyframes: z.array(cameraKeyframeSchema).min(2),
      pointerStrength: z.number().min(0).max(1).default(0.18),
    }),
    objects: z.array(threeObjectSchema).min(1),
    lights: z.array(threeLightSchema).min(1),
    particles: threeParticlesSchema.optional(),
    pixelRatio: z.object({
      high: z.number().min(0.75).max(2).default(1.5),
      medium: z.number().min(0.75).max(1.5).default(1),
      mobile: z.number().min(0.75).max(1.25).default(1),
    }).default({
      high: 1.5,
      medium: 1,
      mobile: 1,
    }),
  }).optional(),
  performance: z.object({
    highRenderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]).optional(),
    mediumRenderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]).optional(),
    lowRenderer: z.enum(["motion-2d", "cinematic-25d", "immersive-3d"]).optional(),
  }).default({}),
  responsive: z.object({
    desktop: responsiveOverrideSchema,
    tablet: responsiveOverrideSchema,
    mobile: responsiveOverrideSchema,
  }).default({}),
});

export type HeroSpec = z.infer<typeof heroSpecSchema>;
export type HeroTextCue = HeroSpec["textTimeline"][number];
export type CinematicLayer = NonNullable<HeroSpec["cinematic25d"]>["layers"][number];
export type Immersive3DSpec = NonNullable<HeroSpec["immersive3d"]>;
export type Immersive3DObject = Immersive3DSpec["objects"][number];

export type Motion2DSpec = NonNullable<HeroSpec["motion2d"]>;
export type Motion2DElement = Motion2DSpec["elements"][number];
