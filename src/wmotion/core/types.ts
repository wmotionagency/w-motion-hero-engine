export type RendererType = "motion-2d" | "cinematic-25d" | "immersive-3d";
export type PerformanceProfile = "high" | "medium" | "low";
export type ResponsiveVariant = "desktop" | "tablet" | "mobile";

export interface HeroScene {
  id: string;
  start: number;
  end: number;
  transitionIn?: string;
  transitionOut?: string;
}

export interface SceneState {
  scene: HeroScene;
  localProgress: number;
}

export interface PointerState {
  x: number;
  y: number;
}

export interface HeroRuntimeState {
  progress: number;
  sceneState: SceneState;
  pointer: PointerState;
  performance: PerformanceProfile;
  responsive: ResponsiveVariant;
  reducedMotion: boolean;
}

export interface HeroRenderer {
  preload(): Promise<void>;
  mount(container: HTMLElement): void;
  setProgress(progress: number): void;
  setPointer?(pointer: PointerState): void;
  setSceneState?(sceneState: SceneState): void;
  setResponsive?(variant: ResponsiveVariant): void;
  resize(): void;
  destroy(): void;
}
