import { gsap } from "gsap";
import type { HeroRenderer, PointerState, ResponsiveVariant, SceneState } from "@/wmotion/core/types";
import type { CinematicLayer } from "@/wmotion/schemas/hero.schema";

type LayerEl = {
  spec: CinematicLayer;
  el: HTMLElement;
};

function lerp(a = 0, b = 0, t: number) {
  return a + (b - a) * t;
}

type SampledTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  blur: number;
};

function normalizeFrame(
  frame: Partial<SampledTransform>,
  fallback: Partial<SampledTransform> = {},
): SampledTransform {
  return {
    x: frame.x ?? fallback.x ?? 0,
    y: frame.y ?? fallback.y ?? 0,
    scale: frame.scale ?? fallback.scale ?? 1,
    rotate: frame.rotate ?? fallback.rotate ?? 0,
    opacity: frame.opacity ?? fallback.opacity ?? 1,
    blur: frame.blur ?? fallback.blur ?? 0,
  };
}

function sampleLayer(layer: CinematicLayer, progress: number): SampledTransform {
  const frames = layer.keyframes;
  const base = normalizeFrame(layer.initial);

  if (progress <= frames[0].at) return normalizeFrame(frames[0], base);
  if (progress >= frames[frames.length - 1].at) {
    return normalizeFrame(frames[frames.length - 1], base);
  }

  const nextIndex = frames.findIndex((frame) => progress <= frame.at);
  const a = frames[Math.max(0, nextIndex - 1)];
  const b = frames[nextIndex];
  const span = Math.max(0.0001, b.at - a.at);
  const t = (progress - a.at) / span;

  const from = normalizeFrame(a, base);
  const to = normalizeFrame(b, from);

  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    scale: lerp(from.scale, to.scale, t),
    rotate: lerp(from.rotate, to.rotate, t),
    opacity: lerp(from.opacity, to.opacity, t),
    blur: lerp(from.blur, to.blur, t),
  };
}

export class Cinematic25DRenderer implements HeroRenderer {
  private root?: HTMLElement;
  private layers: LayerEl[] = [];
  private progress = 0;
  private pointer: PointerState = { x: 0, y: 0 };
  private responsive: ResponsiveVariant = "desktop";
  private sceneState?: SceneState;

  constructor(
    private readonly layerSpecs: CinematicLayer[] = [],
    private readonly pointerStrength = 0.45,
  ) {}

  async preload() {}

  mount(container: HTMLElement) {
    this.root = container;
    this.layers = this.layerSpecs
      .map((spec) => {
        const el = container.querySelector<HTMLElement>(`[data-layer-id="${spec.id}"]`);
        return el ? { spec, el } : null;
      })
      .filter((entry): entry is LayerEl => Boolean(entry));

    this.render();
  }

  setProgress(progress: number) {
    this.progress = progress;
    this.render();
  }

  setPointer(pointer: PointerState) {
    this.pointer = pointer;
    this.render();
  }

  setSceneState(sceneState: SceneState) {
    this.sceneState = sceneState;
    if (this.root) {
      this.root.dataset.scene = sceneState.scene.id;
      this.root.style.setProperty("--wm-scene-progress", sceneState.localProgress.toFixed(4));
    }
  }

  setResponsive(variant: ResponsiveVariant) {
    this.responsive = variant;
    this.render();
  }

  resize() {
    this.render();
  }

  destroy() {
    this.layers.forEach(({ el }) => gsap.killTweensOf(el));
    this.layers = [];
    this.root = undefined;
  }

  private render() {
    if (!this.root) return;

    this.root.style.setProperty("--wm-progress", this.progress.toFixed(4));

    for (const { spec, el } of this.layers) {
      const sampled = sampleLayer(spec, this.progress);
      const mobile = this.responsive === "mobile" ? spec.mobile : undefined;

      if (mobile?.hidden) {
        gsap.set(el, { display: "none" });
        continue;
      }

      const parallax = mobile?.parallax ?? spec.parallax;
      const depthFactor = 0.35 + spec.depth * 0.9;
      const pointerX = this.pointer.x * parallax * this.pointerStrength * depthFactor;
      const pointerY = this.pointer.y * parallax * this.pointerStrength * depthFactor;
      const scaleMultiplier = mobile?.scaleMultiplier ?? 1;

      gsap.set(el, {
        display: "block",
        x: sampled.x + pointerX,
        y: sampled.y + pointerY,
        scale: sampled.scale * scaleMultiplier,
        rotate: sampled.rotate,
        opacity: sampled.opacity,
        filter: sampled.blur ? `blur(${sampled.blur}px)` : "none",
        force3D: true,
        transformOrigin: "50% 50%",
      });
    }
  }
}
