import type { HeroRenderer, PointerState } from "@/wmotion/core/types";

export class Motion2DRenderer implements HeroRenderer {
  private root?: HTMLElement;

  async preload() {}

  mount(container: HTMLElement) {
    this.root = container;
  }

  setProgress(progress: number) {
    this.root?.style.setProperty("--wm-progress", String(progress));
  }

  setPointer(pointer: PointerState) {
    this.root?.style.setProperty("--wm-pointer-x", String(pointer.x));
    this.root?.style.setProperty("--wm-pointer-y", String(pointer.y));
  }

  resize() {}

  destroy() {
    this.root = undefined;
  }
}
