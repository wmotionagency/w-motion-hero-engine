import type { PointerState } from "./types";

export type PointerListener = (pointer: PointerState) => void;

export class InteractionController {
  private pointer: PointerState = { x: 0, y: 0 };
  private listeners = new Set<PointerListener>();
  private cleanup?: () => void;

  mount(target: HTMLElement) {
    const onPointerMove = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;

      this.pointer = {
        x: Math.min(1, Math.max(-1, nx)),
        y: Math.min(1, Math.max(-1, ny)),
      };

      this.listeners.forEach((listener) => listener(this.pointer));
    };

    const onPointerLeave = () => {
      this.pointer = { x: 0, y: 0 };
      this.listeners.forEach((listener) => listener(this.pointer));
    };

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerleave", onPointerLeave);

    this.cleanup = () => {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerleave", onPointerLeave);
    };
  }

  subscribe(listener: PointerListener) {
    this.listeners.add(listener);
    listener(this.pointer);
    return () => this.listeners.delete(listener);
  }

  destroy() {
    this.cleanup?.();
    this.listeners.clear();
  }
}
