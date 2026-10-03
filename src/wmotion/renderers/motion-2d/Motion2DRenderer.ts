import { gsap } from "gsap";
import { AssetLoader } from "@/wmotion/core/AssetLoader";
import type {
  HeroRenderer,
  PointerState,
  ResponsiveVariant,
  SceneState,
} from "@/wmotion/core/types";
import type { Motion2DElement } from "@/wmotion/schemas/hero.schema";

type RuntimeElement = {
  spec: Motion2DElement;
  el: HTMLElement;
};

type SampledTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  blur: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a = 0, b = 0, t: number) {
  return a + (b - a) * t;
}

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

function sampleElement(
  element: Motion2DElement,
  progress: number,
): SampledTransform {
  const frames = element.keyframes;
  const first = normalizeFrame(frames[0]);
  const last = normalizeFrame(frames[frames.length - 1], first);

  if (progress <= frames[0].at) return first;
  if (progress >= frames[frames.length - 1].at) return last;

  const nextIndex = frames.findIndex((frame) => progress <= frame.at);
  const aFrame = frames[Math.max(0, nextIndex - 1)];
  const bFrame = frames[nextIndex];
  const a = normalizeFrame(aFrame, first);
  const b = normalizeFrame(bFrame, a);

  const t = clamp01(
    (progress - aFrame.at) / Math.max(0.0001, bFrame.at - aFrame.at),
  );

  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    scale: lerp(a.scale, b.scale, t),
    rotate: lerp(a.rotate, b.rotate, t),
    opacity: lerp(a.opacity, b.opacity, t),
    blur: lerp(a.blur, b.blur, t),
  };
}

function visibilityFactor(
  element: Motion2DElement,
  progress: number,
  activeSceneId?: string,
) {
  const visibility = element.visibility;
  if (!visibility) return 1;

  if (
    visibility.scenes?.length &&
    activeSceneId &&
    !visibility.scenes.includes(activeSceneId)
  ) {
    return 0;
  }

  const from = visibility.from ?? 0;
  const to = visibility.to ?? 1;
  if (progress < from || progress > to) return 0;

  const span = Math.max(0.0001, to - from);
  const edge = Math.min(0.035, span * 0.18);

  if (progress < from + edge) {
    return clamp01((progress - from) / Math.max(edge, 0.0001));
  }

  if (progress > to - edge) {
    return clamp01((to - progress) / Math.max(edge, 0.0001));
  }

  return 1;
}

function revealProgress(element: Motion2DElement, progress: number) {
  const reveal = element.reveal;
  if (!reveal || reveal.type === "none") return 1;

  const raw = clamp01(
    (progress - reveal.from) / Math.max(0.0001, reveal.to - reveal.from),
  );

  return reveal.invert ? 1 - raw : raw;
}

function revealClipPath(element: Motion2DElement, progress: number) {
  const reveal = element.reveal;
  if (!reveal || reveal.type === "none" || reveal.type === "fade") {
    return "none";
  }

  const p = revealProgress(element, progress);

  if (reveal.type === "wipe-x") {
    return `inset(0 ${(1 - p) * 100}% 0 0)`;
  }

  if (reveal.type === "wipe-y") {
    return `inset(0 0 ${(1 - p) * 100}% 0)`;
  }

  return `circle(${p * 74}% at 50% 50%)`;
}

export class Motion2DRenderer implements HeroRenderer {
  private root?: HTMLElement;
  private elements: RuntimeElement[] = [];
  private pointer: PointerState = { x: 0, y: 0 };
  private progress = 0;
  private responsive: ResponsiveVariant = "desktop";
  private sceneState?: SceneState;
  private readonly loader = new AssetLoader();

  constructor(
    private readonly specs: Motion2DElement[] = [],
    private readonly pointerStrength = 0.2,
  ) {}

  async preload() {
    const urls = this.specs.flatMap((element) => {
      const urls: string[] = [];
      if (element.asset?.src) urls.push(element.asset.src);
      if (element.mobile?.assetSrc) urls.push(element.mobile.assetSrc);
      return urls;
    });

    await this.loader.preloadImages([...new Set(urls)]);
  }

  mount(container: HTMLElement) {
    this.root = container;
    this.elements = this.specs
      .map((spec) => {
        const el = container.querySelector<HTMLElement>(
          `[data-motion-id="${spec.id}"]`,
        );
        return el ? { spec, el } : null;
      })
      .filter((entry): entry is RuntimeElement => Boolean(entry));

    this.render();
  }

  setProgress(progress: number) {
    this.progress = clamp01(progress);
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
      this.root.style.setProperty(
        "--wm-scene-progress",
        sceneState.localProgress.toFixed(4),
      );
    }
    this.render();
  }

  setResponsive(variant: ResponsiveVariant) {
    this.responsive = variant;
    this.render();
  }

  resize() {
    this.render();
  }

  destroy() {
    this.elements.forEach(({ el }) => gsap.killTweensOf(el));
    this.elements = [];
    this.root = undefined;
  }

  private render() {
    if (!this.root) return;

    this.root.style.setProperty("--wm-progress", this.progress.toFixed(4));

    for (const { spec, el } of this.elements) {
      const mobile = this.responsive === "mobile" ? spec.mobile : undefined;

      if (mobile?.hidden) {
        gsap.set(el, { display: "none" });
        continue;
      }

      const sampled = sampleElement(spec, this.progress);
      const visible = visibilityFactor(
        spec,
        this.progress,
        this.sceneState?.scene.id,
      );

      const reveal = revealProgress(spec, this.progress);
      const revealOpacity = spec.reveal?.type === "fade" ? reveal : 1;

      const pointerInfluence =
        mobile?.pointerInfluence ??
        spec.pointerInfluence * (this.responsive === "mobile" ? 0.25 : 1);

      const x =
        sampled.x +
        this.pointer.x * pointerInfluence * 48 * this.pointerStrength;
      const y =
        sampled.y +
        this.pointer.y * pointerInfluence * 36 * this.pointerStrength;

      const scaleMultiplier = mobile?.scaleMultiplier ?? 1;

      gsap.set(el, {
        display: "block",
        x,
        y,
        scale: sampled.scale * scaleMultiplier,
        rotate: sampled.rotate,
        opacity: sampled.opacity * visible * revealOpacity,
        filter: sampled.blur ? `blur(${sampled.blur}px)` : "none",
        clipPath: revealClipPath(spec, this.progress),
        mixBlendMode: spec.style.mixBlendMode,
        force3D: true,
        transformOrigin: "50% 50%",
      });
    }
  }
}
