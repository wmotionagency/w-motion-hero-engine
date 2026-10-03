import type { HeroRenderer, PointerState } from "@/wmotion/core/types";

export class Immersive3DRenderer implements HeroRenderer {
  private container?: HTMLElement;

  async preload() {
    // Future: GLB, environment maps and shader assets.
  }

  mount(container: HTMLElement) {
    this.container = container;
  }

  setProgress(progress: number) {
    this.container?.style.setProperty("--wm-3d-progress", String(progress));
  }

  setPointer(pointer: PointerState) {
    this.container?.style.setProperty("--wm-3d-pointer-x", String(pointer.x));
    this.container?.style.setProperty("--wm-3d-pointer-y", String(pointer.y));
  }

  resize() {
    // Future: renderer/camera resize.
  }

  destroy() {
    this.container = undefined;
  }
}
