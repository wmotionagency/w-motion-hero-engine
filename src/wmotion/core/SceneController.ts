import type { HeroScene, SceneState } from "./types";

export class SceneController {
  constructor(private readonly scenes: HeroScene[]) {
    if (!scenes.length) throw new Error("SceneController requires at least one scene.");
  }

  getState(globalProgress: number): SceneState {
    const progress = Math.min(1, Math.max(0, globalProgress));

    const scene =
      this.scenes.find((candidate) => progress >= candidate.start && progress <= candidate.end) ??
      (progress < this.scenes[0].start ? this.scenes[0] : this.scenes[this.scenes.length - 1]);

    const span = Math.max(0.000001, scene.end - scene.start);
    const localProgress = Math.min(1, Math.max(0, (progress - scene.start) / span));

    return { scene, localProgress };
  }
}
