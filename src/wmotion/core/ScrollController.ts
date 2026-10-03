export type ProgressListener = (progress: number) => void;

export class ScrollController {
  private progress = 0;
  private listeners = new Set<ProgressListener>();

  setProgress(next: number) {
    this.progress = Math.min(1, Math.max(0, next));
    this.listeners.forEach((listener) => listener(this.progress));
  }

  getProgress() {
    return this.progress;
  }

  subscribe(listener: ProgressListener) {
    this.listeners.add(listener);
    listener(this.progress);
    return () => this.listeners.delete(listener);
  }
}
