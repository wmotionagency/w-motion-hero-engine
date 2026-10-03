import type { PerformanceProfile, ResponsiveVariant } from "./types";

export interface PerformanceSnapshot {
  profile: PerformanceProfile;
  responsive: ResponsiveVariant;
  reducedMotion: boolean;
}

export class PerformanceManager {
  detect(): PerformanceSnapshot {
    if (typeof window === "undefined") {
      return { profile: "medium", responsive: "desktop", reducedMotion: false };
    }

    const width = window.innerWidth;
    const responsive: ResponsiveVariant =
      width < 768 ? "mobile" : width < 1100 ? "tablet" : "desktop";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const touch = navigator.maxTouchPoints > 0;

    if (reducedMotion) {
      return { profile: "low", responsive, reducedMotion: true };
    }

    let score = 0;
    if (cores >= 8) score += 2;
    else if (cores >= 4) score += 1;

    if (memory >= 8) score += 2;
    else if (memory >= 4) score += 1;

    if (dpr <= 2) score += 1;
    else if (dpr >= 3) score -= 1;

    if (touch && width < 768) score -= 1;

    const profile: PerformanceProfile = score >= 4 ? "high" : score >= 2 ? "medium" : "low";

    return { profile, responsive, reducedMotion };
  }
}
