import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type {
  HeroRenderer,
  PerformanceProfile,
  PointerState,
  ResponsiveVariant,
  SceneState,
} from "@/wmotion/core/types";
import type {
  Immersive3DObject,
  Immersive3DSpec,
} from "@/wmotion/schemas/hero.schema";

type RuntimeObject = {
  spec: Immersive3DObject;
  object: THREE.Object3D;
};

type TransformSample = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  opacity: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
) {
  return new THREE.Vector3(
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  );
}

function sampleTransform(
  spec: Immersive3DObject,
  progress: number,
): TransformSample {
  const frames = spec.keyframes;
  const first = frames[0];
  const last = frames[frames.length - 1];

  const read = (
    frame: typeof first,
    fallback?: typeof first,
  ): TransformSample => ({
    position: new THREE.Vector3(
      ...(frame.position ?? fallback?.position ?? [0, 0, 0]),
    ),
    rotation: new THREE.Euler(
      ...(frame.rotation ?? fallback?.rotation ?? [0, 0, 0]),
    ),
    scale: new THREE.Vector3(
      ...(frame.scale ?? fallback?.scale ?? [1, 1, 1]),
    ),
    opacity: frame.opacity ?? fallback?.opacity ?? 1,
  });

  if (progress <= first.at) return read(first);
  if (progress >= last.at) return read(last, first);

  const nextIndex = frames.findIndex((frame) => progress <= frame.at);
  const fromFrame = frames[Math.max(0, nextIndex - 1)];
  const toFrame = frames[nextIndex];
  const from = read(fromFrame, first);
  const to = read(toFrame, fromFrame);
  const t = clamp01(
    (progress - fromFrame.at) / Math.max(0.0001, toFrame.at - fromFrame.at),
  );

  return {
    position: from.position.clone().lerp(to.position, t),
    rotation: new THREE.Euler(
      lerp(from.rotation.x, to.rotation.x, t),
      lerp(from.rotation.y, to.rotation.y, t),
      lerp(from.rotation.z, to.rotation.z, t),
    ),
    scale: from.scale.clone().lerp(to.scale, t),
    opacity: lerp(from.opacity, to.opacity, t),
  };
}

function sampleCamera(spec: Immersive3DSpec, progress: number) {
  const frames = spec.camera.keyframes;
  const first = frames[0];
  const last = frames[frames.length - 1];

  if (progress <= first.at) {
    return {
      position: new THREE.Vector3(...first.position),
      target: new THREE.Vector3(...first.target),
      fov: first.fov ?? 48,
    };
  }

  if (progress >= last.at) {
    return {
      position: new THREE.Vector3(...last.position),
      target: new THREE.Vector3(...last.target),
      fov: last.fov ?? first.fov ?? 48,
    };
  }

  const nextIndex = frames.findIndex((frame) => progress <= frame.at);
  const a = frames[Math.max(0, nextIndex - 1)];
  const b = frames[nextIndex];
  const t = clamp01(
    (progress - a.at) / Math.max(0.0001, b.at - a.at),
  );

  return {
    position: lerpVec3(a.position, b.position, t),
    target: lerpVec3(a.target, b.target, t),
    fov: lerp(a.fov ?? 48, b.fov ?? a.fov ?? 48, t),
  };
}

function visibilityFactor(
  spec: Immersive3DObject,
  progress: number,
  activeSceneId?: string,
) {
  const visibility = spec.visibility;
  if (!visibility) return 1;

  if (
    visibility.scenes?.length &&
    activeSceneId &&
    !visibility.scenes.includes(activeSceneId)
  ) {
    return 0;
  }

  const from = visibility.from ?? 0;
  const to = visibility.to ?? 1;
  if (progress < from || progress > to) return 0;

  const span = Math.max(0.0001, to - from);
  const edge = Math.min(0.04, span * 0.18);

  if (progress < from + edge) {
    return clamp01((progress - from) / Math.max(edge, 0.0001));
  }

  if (progress > to - edge) {
    return clamp01((to - progress) / Math.max(edge, 0.0001));
  }

  return 1;
}

function setObjectOpacity(object: THREE.Object3D, opacity: number) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      material.transparent = opacity < 0.999 || material.transparent;
      material.opacity = opacity;
      material.depthWrite = opacity > 0.02;
      material.needsUpdate = true;
    }
  });
}

function seededRandom(index: number) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export class Immersive3DRenderer implements HeroRenderer {
  private container?: HTMLElement;
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private runtimeObjects: RuntimeObject[] = [];
  private particles?: THREE.Points;
  private gltfLoader = new GLTFLoader();
  private preloadedModels = new Map<string, THREE.Object3D>();
  private progress = 0;
  private pointer: PointerState = { x: 0, y: 0 };
  private responsive: ResponsiveVariant = "desktop";
  private performance: PerformanceProfile = "high";
  private sceneState?: SceneState;

  constructor(private readonly spec?: Immersive3DSpec) {}

  async preload() {
    if (!this.spec) return;

    const modelSources = [
      ...new Set(
        this.spec.objects
          .filter((object) => object.kind === "model" && object.modelSrc)
          .map((object) => object.modelSrc as string),
      ),
    ];

    await Promise.all(
      modelSources.map(async (src) => {
        try {
          const gltf = await this.gltfLoader.loadAsync(src);
          this.preloadedModels.set(src, gltf.scene);
        } catch (error) {
          console.warn(`W Motion: unable to preload 3D model ${src}`, error);
        }
      }),
    );
  }

  mount(container: HTMLElement) {
    this.container = container;
    if (!this.spec) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(this.spec.background);

    if (this.spec.fog) {
      scene.fog = new THREE.Fog(
        this.spec.fog.color,
        this.spec.fog.near,
        this.spec.fog.far,
      );
    }

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: this.performance === "high",
      powerPreference: "high-performance",
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "immersive-3d-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");

    container.prepend(renderer.domElement);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.createLights();
    this.createObjects();
    this.createParticles();
    this.resize();
    this.render();
  }

  setProgress(progress: number) {
    this.progress = clamp01(progress);
    this.render();
  }

  setPointer(pointer: PointerState) {
    this.pointer = pointer;
    this.render();
  }

  setSceneState(sceneState: SceneState) {
    this.sceneState = sceneState;

    if (this.container) {
      this.container.dataset.scene = sceneState.scene.id;
      this.container.style.setProperty(
        "--wm-scene-progress",
        sceneState.localProgress.toFixed(4),
      );
    }

    this.render();
  }

  setResponsive(variant: ResponsiveVariant) {
    this.responsive = variant;
    this.applyPixelRatio();
    this.render();
  }

  setPerformance(profile: PerformanceProfile) {
    this.performance = profile;
    this.applyPixelRatio();
    this.render();
  }

  resize() {
    if (!this.container || !this.renderer || !this.camera) return;

    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.applyPixelRatio();
    this.renderer.setSize(width, height, false);
    this.render();
  }

  destroy() {
    this.runtimeObjects.forEach(({ object }) => {
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry?.dispose();

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => material.dispose());
      });
    });

    if (this.particles) {
      this.particles.geometry.dispose();
      const material = this.particles.material;
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
    }

    this.renderer?.dispose();
    this.renderer?.domElement.remove();

    this.runtimeObjects = [];
    this.preloadedModels.clear();
    this.particles = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.container = undefined;
  }

  private createLights() {
    if (!this.scene || !this.spec) return;

    for (const lightSpec of this.spec.lights) {
      let light: THREE.Light;

      if (lightSpec.type === "ambient") {
        light = new THREE.AmbientLight(
          lightSpec.color,
          lightSpec.intensity,
        );
      } else if (lightSpec.type === "directional") {
        light = new THREE.DirectionalLight(
          lightSpec.color,
          lightSpec.intensity,
        );
      } else {
        light = new THREE.PointLight(
          lightSpec.color,
          lightSpec.intensity,
          30,
          2,
        );
      }

      if (lightSpec.position) {
        light.position.set(...lightSpec.position);
      }

      light.name = lightSpec.id;
      this.scene.add(light);
    }
  }

  private createObjects() {
    if (!this.scene || !this.spec) return;

    this.runtimeObjects = this.spec.objects
      .map((objectSpec) => {
        const object = this.createObject(objectSpec);
        if (!object) return null;

        object.name = objectSpec.id;
        this.scene?.add(object);

        return {
          spec: objectSpec,
          object,
        };
      })
      .filter((entry): entry is RuntimeObject => Boolean(entry));
  }

  private createObject(spec: Immersive3DObject) {
    if (spec.kind === "model" && spec.modelSrc) {
      const preloaded = this.preloadedModels.get(spec.modelSrc);
      return preloaded?.clone(true) ?? null;
    }

    let geometry: THREE.BufferGeometry;

    if (spec.kind === "box") {
      geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 8, 8, 8);
    } else if (spec.kind === "torus") {
      geometry = new THREE.TorusGeometry(1.5, 0.12, 32, 128);
    } else if (spec.kind === "icosahedron") {
      geometry = new THREE.IcosahedronGeometry(1.45, 5);
    } else {
      geometry = new THREE.SphereGeometry(1.45, 64, 64);
    }

    const material = new THREE.MeshStandardMaterial({
      color: spec.material.color,
      metalness: spec.material.metalness,
      roughness: spec.material.roughness,
      emissive: spec.material.emissive,
      emissiveIntensity: spec.material.emissiveIntensity,
      transparent: spec.material.transparent,
      opacity: spec.material.opacity,
      wireframe: spec.material.wireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = spec.castShadow;
    mesh.receiveShadow = spec.receiveShadow;

    return mesh;
  }

  private createParticles() {
    if (!this.scene || !this.spec?.particles?.enabled) return;

    const config = this.spec.particles;
    const count =
      this.performance === "high"
        ? config.count
        : this.performance === "medium"
          ? Math.round(config.count * 0.55)
          : 0;

    if (!count) return;

    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] =
        (seededRandom(index * 3) - 0.5) * config.spread;
      positions[index * 3 + 1] =
        (seededRandom(index * 3 + 1) - 0.5) * config.spread * 0.65;
      positions[index * 3 + 2] =
        (seededRandom(index * 3 + 2) - 0.5) * config.spread;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const material = new THREE.PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: config.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private applyPixelRatio() {
    if (!this.renderer || !this.spec) return;

    const configured =
      this.responsive === "mobile"
        ? this.spec.pixelRatio.mobile
        : this.performance === "high"
          ? this.spec.pixelRatio.high
          : this.spec.pixelRatio.medium;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, configured),
    );
  }

  private render() {
    if (!this.renderer || !this.scene || !this.camera || !this.spec) {
      return;
    }

    const cameraSample = sampleCamera(this.spec, this.progress);
    const pointerStrength = this.spec.camera.pointerStrength;
    const mobileFactor = this.responsive === "mobile" ? 0.35 : 1;

    this.camera.position.copy(cameraSample.position);
    this.camera.position.x +=
      this.pointer.x * pointerStrength * mobileFactor;
    this.camera.position.y -=
      this.pointer.y * pointerStrength * 0.6 * mobileFactor;
    this.camera.fov = cameraSample.fov;
    this.camera.updateProjectionMatrix();

    const target = cameraSample.target.clone();
    target.x += this.pointer.x * pointerStrength * 0.35 * mobileFactor;
    target.y -= this.pointer.y * pointerStrength * 0.2 * mobileFactor;
    this.camera.lookAt(target);

    for (const runtime of this.runtimeObjects) {
      const { spec, object } = runtime;
      const hiddenMobile =
        this.responsive === "mobile" && spec.mobile?.hidden;

      if (hiddenMobile) {
        object.visible = false;
        continue;
      }

      const sample = sampleTransform(spec, this.progress);
      const visible = visibilityFactor(
        spec,
        this.progress,
        this.sceneState?.scene.id,
      );

      object.visible = visible > 0.001;
      object.position.copy(sample.position);
      object.rotation.copy(sample.rotation);

      const scaleMultiplier =
        this.responsive === "mobile"
          ? spec.mobile?.scaleMultiplier ?? 1
          : 1;

      object.scale.copy(sample.scale).multiplyScalar(scaleMultiplier);

      const pointerAmount =
        spec.pointerInfluence *
        (this.responsive === "mobile" ? 0.25 : 1);

      object.rotation.y += this.pointer.x * pointerAmount;
      object.rotation.x -= this.pointer.y * pointerAmount * 0.55;

      setObjectOpacity(
        object,
        sample.opacity * visible * spec.material.opacity,
      );
    }

    if (this.particles) {
      this.particles.rotation.y = this.progress * Math.PI * 0.32;
      this.particles.rotation.x =
        this.pointer.y * 0.025 - this.progress * 0.04;
      this.particles.position.z = lerp(0, 1.4, this.progress);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
