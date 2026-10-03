import { InteractionController } from "./InteractionController";
import { PerformanceManager } from "./PerformanceManager";
import { SceneController } from "./SceneController";
import { ScrollController } from "./ScrollController";
import type { HeroRenderer, HeroRuntimeState, HeroScene, PointerState } from "./types";

export type HeroStateListener = (state: HeroRuntimeState) => void;

export class HeroController {
  readonly scroll = new ScrollController();
  readonly interaction = new InteractionController();
  readonly performance = new PerformanceManager();
  readonly scenes: SceneController;

  private renderer?: HeroRenderer;
  private pointer: PointerState = { x: 0, y: 0 };
  private listeners = new Set<HeroStateListener>();
  private unsubscribers: Array<() => void> = [];

  constructor(scenes: HeroScene[]) {
    this.scenes = new SceneController(scenes);
  }

  async mount(container: HTMLElement, renderer: HeroRenderer) {
    this.renderer = renderer;
    const perf = this.performance.detect();

    await renderer.preload();
    renderer.mount(container);
    renderer.setResponsive?.(perf.responsive);
    renderer.setPerformance?.(perf.profile);
    this.interaction.mount(container);

    this.unsubscribers.push(
      this.scroll.subscribe((progress) => {
        renderer.setProgress(progress);
        const sceneState = this.scenes.getState(progress);
        renderer.setSceneState?.(sceneState);
        this.emit(perf);
      }),
      this.interaction.subscribe((pointer) => {
        this.pointer = pointer;
        renderer.setPointer?.(pointer);
        this.emit(perf);
      }),
    );

    this.emit(perf);
  }

  subscribe(listener: HeroStateListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resize() {
    const perf = this.performance.detect();
    this.renderer?.setResponsive?.(perf.responsive);
    this.renderer?.setPerformance?.(perf.profile);
    this.renderer?.resize();
    this.emit(perf);
  }

  destroy() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.interaction.destroy();
    this.renderer?.destroy();
    this.renderer = undefined;
    this.listeners.clear();
  }

  private emit(perf = this.performance.detect()) {
    const progress = this.scroll.getProgress();
    const state: HeroRuntimeState = {
      progress,
      sceneState: this.scenes.getState(progress),
      pointer: this.pointer,
      performance: perf.profile,
      responsive: perf.responsive,
      reducedMotion: perf.reducedMotion,
    };

    this.listeners.forEach((listener) => listener(state));
  }
}
