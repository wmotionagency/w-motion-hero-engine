import { gsap } from "gsap";
import type { HeroRenderer, PointerState, SceneState } from "@/wmotion/core/types";

export class Cinematic25DRenderer implements HeroRenderer {
  private root?: HTMLElement;
  private orb?: HTMLElement;
  private progress = 0;
  private pointer: PointerState = { x: 0, y: 0 };

  async preload() {}

  mount(container: HTMLElement) {
    this.root = container;
    this.orb = container.querySelector<HTMLElement>("[data-demo-orb]") ?? undefined;
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

  setSceneState(_sceneState: SceneState) {}

  resize() {
    this.render();
  }

  destroy() {
    if (this.orb) gsap.killTweensOf(this.orb);
    this.root = undefined;
    this.orb = undefined;
  }

  private render() {
    if (!this.orb) return;

    const p = this.progress;
    const scale = 0.72 + p * 1.2;
    const travelX = p < 0.66 ? (p / 0.66) * 18 : 18 - ((p - 0.66) / 0.34) * 12;
    const travelY = p < 0.5 ? (0.5 - p) * 80 : -(p - 0.5) * 90;
    const rotate = -10 + p * 26 + this.pointer.x * 4;
    const pointerX = this.pointer.x * 18;
    const pointerY = this.pointer.y * 12;

    gsap.set(this.orb, {
      xPercent: travelX,
      y: travelY + pointerY,
      x: pointerX,
      scale,
      rotate,
      opacity: p > 0.92 ? Math.max(0.15, 1 - (p - 0.92) * 5) : 1,
      transformOrigin: "50% 50%",
      force3D: true,
    });
  }
}
