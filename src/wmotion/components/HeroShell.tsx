"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroController } from "@/wmotion/core/HeroController";
import type {
  HeroRenderer,
  HeroRuntimeState,
  RendererType,
  ResponsiveVariant,
} from "@/wmotion/core/types";
import { Cinematic25DRenderer } from "@/wmotion/renderers/cinematic-25d/Cinematic25DRenderer";
import { Immersive3DRenderer } from "@/wmotion/renderers/immersive-3d/Immersive3DRenderer";
import { Motion2DRenderer } from "@/wmotion/renderers/motion-2d/Motion2DRenderer";
import type { CinematicLayer, HeroSpec } from "@/wmotion/schemas/hero.schema";
import { HeroTextLayer } from "./HeroTextLayer";
import { ScrollIndicator } from "./ScrollIndicator";

function createRenderer(type: RendererType, spec: HeroSpec): HeroRenderer {
  if (type === "motion-2d") return new Motion2DRenderer();

  if (type === "immersive-3d") {
    return new Immersive3DRenderer(spec.immersive3d);
  }

  return new Cinematic25DRenderer(
    spec.cinematic25d?.layers ?? [],
    spec.cinematic25d?.pointerStrength ?? 0.45,
  );
}

function webGL2Available() {
  if (typeof document === "undefined") return true;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

function selectRenderer(spec: HeroSpec, state?: HeroRuntimeState): RendererType {
  if (!state) return spec.renderer;
  if (state.reducedMotion) return "motion-2d";

  const byProfile = {
    high: spec.performance.highRenderer,
    medium: spec.performance.mediumRenderer,
    low: spec.performance.lowRenderer,
  } as const;

  const selected = byProfile[state.performance] ?? spec.renderer;

  if (selected === "immersive-3d" && !webGL2Available()) {
    if (spec.cinematic25d?.layers.length) return "cinematic-25d";
    return "motion-2d";
  }

  return selected;
}

function initialRuntime(spec: HeroSpec): HeroRuntimeState {
  return {
    progress: 0,
    sceneState: {
      scene: spec.scenes[0],
      localProgress: 0,
    },
    pointer: { x: 0, y: 0 },
    performance: "medium",
    responsive: "desktop",
    reducedMotion: false,
  };
}

function LayerVisual({
  layer,
  responsive,
}: {
  layer: CinematicLayer;
  responsive: ResponsiveVariant;
}) {
  if (layer.kind !== "image" || !layer.asset) {
    return (
      <span
        className={`cinematic-shape cinematic-shape--${layer.kind}`}
        aria-hidden="true"
      />
    );
  }

  const src =
    responsive === "mobile" && layer.mobile?.assetSrc
      ? layer.mobile.assetSrc
      : layer.asset.src;

  const position =
    responsive === "mobile" && layer.mobile?.position
      ? layer.mobile.position
      : layer.asset.position;

  return (
    <span
      className={`cinematic-asset cinematic-asset--${layer.role}`}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt={layer.asset.alt}
        fill
        sizes="100vw"
        priority={layer.asset.preload}
        unoptimized={src.endsWith(".svg")}
        style={{
          objectFit: layer.asset.fit,
          objectPosition: position,
        }}
      />
    </span>
  );
}

export function HeroShell({ spec }: { spec: HeroSpec }) {
  const zoneRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controller = useMemo(
    () => new HeroController(spec.scenes),
    [spec.scenes],
  );
  const [runtime, setRuntime] = useState<HeroRuntimeState>(() =>
    initialRuntime(spec),
  );

  const activeRenderer = selectRenderer(spec, runtime);

  const scrollLength =
    runtime.responsive === "mobile"
      ? spec.responsive.mobile?.scrollLength ?? spec.scrollLength
      : runtime.responsive === "tablet"
        ? spec.responsive.tablet?.scrollLength ?? spec.scrollLength
        : spec.responsive.desktop?.scrollLength ?? spec.scrollLength;

  useEffect(() => {
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    const unsubscribe = controller.subscribe((state) => setRuntime(state));
    const detected = controller.performance.detect();
    const detectedState: HeroRuntimeState = {
      ...initialRuntime(spec),
      performance: detected.profile,
      responsive: detected.responsive,
      reducedMotion: detected.reducedMotion,
    };
    const rendererType = selectRenderer(spec, detectedState);
    const renderer = createRenderer(rendererType, spec);

    let trigger: ScrollTrigger | undefined;
    let cancelled = false;

    void controller.mount(stage, renderer).then(() => {
      if (cancelled) return;

      if (detected.reducedMotion) {
        controller.scroll.setProgress(1);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => controller.scroll.setProgress(self.progress),
      });
    });

    const onResize = () => {
      controller.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      trigger?.kill();
      unsubscribe();
      controller.destroy();
    };
  }, [controller, spec]);

  const preset = spec.cinematic25d?.preset ?? "neutral";

  return (
    <main>
      <section
        ref={zoneRef}
        className="hero-scroll-zone"
        data-preset={preset}
        data-active-renderer={activeRenderer}
        style={
          { "--hero-scroll-length": `${scrollLength}vh` } as React.CSSProperties
        }
      >
        <div className="hero-sticky">
          <div
            ref={stageRef}
            className="hero-stage"
            data-renderer={spec.renderer}
            data-active-renderer={activeRenderer}
            data-preset={preset}
          >
            {activeRenderer === "cinematic-25d" ? (
              <div
                className="cinematic-world"
                data-preset={preset}
                aria-hidden="true"
              >
                {(spec.cinematic25d?.layers ?? []).map((layer) => (
                  <div
                    key={layer.id}
                    className={`cinematic-layer cinematic-layer--${layer.kind} cinematic-layer--role-${layer.role} ${layer.className ?? ""}`}
                    data-layer-id={layer.id}
                    data-role={layer.role}
                    style={{ zIndex: Math.round(layer.depth * 100) }}
                  >
                    <LayerVisual
                      layer={layer}
                      responsive={runtime.responsive}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <HeroTextLayer
            cues={spec.textTimeline}
            progress={runtime.progress}
            reducedMotion={runtime.reducedMotion}
          />

          <ScrollIndicator />

          <aside className="hero-debug" aria-label="Hero engine debug">
            <span>Progress: {runtime.progress.toFixed(3)}</span>
            <span>Scene: {runtime.sceneState.scene.id}</span>
            <span>
              Local Progress: {runtime.sceneState.localProgress.toFixed(3)}
            </span>
            <span>Performance: {runtime.performance}</span>
            <span>Responsive: {runtime.responsive}</span>
            <span>Renderer: {activeRenderer}</span>
            <span>Preset: {preset}</span>
            <span>
              Pointer: {runtime.pointer.x.toFixed(2)},{" "}
              {runtime.pointer.y.toFixed(2)}
            </span>
          </aside>
        </div>
      </section>
    </main>
  );
}
