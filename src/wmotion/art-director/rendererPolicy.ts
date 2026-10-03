export const RENDERER_SELECTION_POLICY = {
  "motion-2d": {
    chooseWhen: [
      "The core idea is typography, UI, vector morphing, graphic composition, or simple product motion.",
      "The experience needs maximum mobile robustness and minimal asset weight.",
      "Depth can be implied without multiple photographic planes or a real camera.",
    ],
    avoidWhen: [
      "The concept depends on strong depth transitions or moving through a spatial scene.",
    ],
  },
  "cinematic-25d": {
    chooseWhen: [
      "The concept is image-led and benefits from separate background, subject, foreground, light, or atmosphere planes.",
      "A premium reveal, depth shift, subject replacement, or camera-like push can be faked convincingly with layers.",
      "The experience should feel cinematic while remaining lighter and safer than real-time 3D.",
    ],
    avoidWhen: [
      "The main subject must rotate freely in true 3D or the camera must move around/through real geometry.",
    ],
  },
  "immersive-3d": {
    chooseWhen: [
      "True perspective continuity is essential to the concept.",
      "The user must orbit, pass around, or enter a 3D object/space.",
      "The hero moment cannot be convincingly reproduced with layered 2.5D assets.",
    ],
    avoidWhen: [
      "3D is being chosen only because it looks premium.",
      "The same concept can be delivered with 2.5D at lower runtime cost.",
    ],
    requiredFallback: "cinematic-25d or motion-2d",
  },
} as const;

export function rendererPolicyText() {
  return Object.entries(RENDERER_SELECTION_POLICY)
    .map(([renderer, policy]) => {
      const lines = [
        `${renderer.toUpperCase()}:`,
        "Choose when:",
        ...policy.chooseWhen.map((item) => `- ${item}`),
        "Avoid when:",
        ...policy.avoidWhen.map((item) => `- ${item}`),
      ];

      if ("requiredFallback" in policy) {
        lines.push(`Required fallback: ${policy.requiredFallback}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}
