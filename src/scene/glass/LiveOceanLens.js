import * as THREE from "three/webgpu";
import { LensDeformation } from "./LensDeformation.js";
import {
  Fn,
  uniform,
  screenUV,
  vec2,
  vec3,
  vec4,
  texture,
  dot,
  normalize,
  refract,
  sqrt,
  max,
  min,
  smoothstep,
  mix,
  perspectiveDepthToViewZ,
} from "three/tsl";

// Original world-space ellipsoid. Trace both interfaces through CURRENT ocean
// color. The lens never enters its own input. No second ocean or renderer.
export class LiveOceanLens {
  constructor(renderer, camera) {
    this.renderer = renderer;
    this.camera = camera;
    this.enabled = true;
    this.disposed = false;
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.deformation = new LensDeformation();
    this.translation = new THREE.Vector3();
    this.shape = new THREE.Matrix4();
    this.elapsed = 0;
    this.anchored = false;
    this.lastTime = performance.now();
    this.cpu = [];
    this.size = new THREE.Vector2();
    this.unit = new THREE.Vector3(1, 1, 1);
    this.world = new THREE.Matrix4();
    this.inverse = new THREE.Matrix4();
    this.radii = uniform(new THREE.Vector3(0.92, 1.08, 0.32));
    this.cameraToLens = uniform(new THREE.Matrix4());
    this.lensToView = uniform(new THREE.Matrix4());
    this.normalToView = uniform(new THREE.Matrix3());
    this.projection = uniform(new THREE.Matrix4());
    this.inverseProjection = uniform(new THREE.Matrix4());
    this.near = uniform(camera.near);
    this.far = uniform(camera.far);
    this.strength = uniform(1);
    this.visibility = uniform(0);
    this.eta = uniform(1 / 1.045);
    this.target = new THREE.RenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.LinearSRGBColorSpace,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      samples: renderer.samples,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    this.target.texture.name = "M3 live ocean color (no lens)";
    this.target.depthTexture.name = "M3 opaque ocean depth";
    this.output = new THREE.PostProcessing(renderer, this.optics());
    this.anchor();
    this.render = this.render.bind(this);
    this.installPointer();
  }
  anchor() {
    this.camera.updateMatrixWorld();
    this.position.set(0.35, -0.03, -4).applyMatrix4(this.camera.matrixWorld);
    this.rotation.copy(this.camera.quaternion);
  }
  installPointer() {
    const local = new THREE.Vector3(),
      normal = new THREE.Vector3(),
      ray = new THREE.Raycaster(),
      plane = new THREE.Plane();
    const point = (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          1 - ((event.clientY - rect.top) / rect.height) * 2,
        ),
        this.camera,
      );
      normal.set(0, 0, 1).applyQuaternion(this.rotation);
      plane.setFromNormalAndCoplanarPoint(normal, this.position);
      if (!ray.ray.intersectPlane(plane, local)) return null;
      local.sub(this.position).applyQuaternion(this.rotation.clone().invert());
      return [local.x, local.y];
    };
    this.onDown = (event) => {
      if (
        !this.enabled ||
        event.button !== 0 ||
        !event.shiftKey ||
        document.querySelector(".idle-screen.is-active")
      )
        return;
      const p = point(event);
      if (!p || Math.hypot(p[0] / 0.92, p[1] / 1.08) > 1) return;
      this.deformation.begin(...p);
      event.stopImmediatePropagation();
      event.preventDefault();
    };
    this.onMove = (event) => {
      if (!this.deformation.dragging) return;
      const p = point(event);
      if (p) this.deformation.move(...p);
      event.stopImmediatePropagation();
    };
    this.onUp = (event) => {
      if (!this.deformation.dragging) return;
      this.deformation.release();
      event.stopImmediatePropagation();
    };
    this.onHidden = () => {
      this.lastTime = performance.now();
      this.deformation.release();
    };
    this.onKey = (event) => {
      if (event.code === "KeyL" && !event.ctrlKey && !event.metaKey) {
        this.anchor();
        this.anchored = true;
        this.deformation.reset();
      }
    };
    window.addEventListener("pointerdown", this.onDown, true);
    window.addEventListener("pointermove", this.onMove, true);
    window.addEventListener("pointerup", this.onUp, true);
    window.addEventListener("pointercancel", this.onUp, true);
    window.addEventListener("blur", this.onHidden);
    document.addEventListener("visibilitychange", this.onHidden);
    window.addEventListener("keydown", this.onKey);
  }
  optics() {
    return Fn(() => {
      const st = screenUV,
        original = texture(this.target.texture, st).toVar();
      const viewRay = this.inverseProjection.mul(
        vec4(st.x.mul(2).sub(1), st.y.mul(-2).add(1), 1, 1),
      );
      const viewDirection = normalize(viewRay.xyz.div(viewRay.w)).toVar();
      const direction = this.cameraToLens
        .mul(vec4(viewDirection, 0))
        .xyz.toVar();
      const origin = this.cameraToLens.mul(vec4(0, 0, 0, 1)).xyz.toVar();
      const o = origin.div(this.radii),
        d = direction.div(this.radii);
      const a = dot(d, d),
        b = dot(o, d),
        c = dot(o, o).sub(1);
      const disc = b.mul(b).sub(a.mul(c)).toVar(),
        root = sqrt(max(disc, 0.000001));
      const entryDistance = b.negate().sub(root).div(a).toVar();
      const entry = origin.add(direction.mul(entryDistance)).toVar();
      const normal = normalize(entry.div(this.radii.mul(this.radii))).toVar();
      // Refraction needs metric view-space directions/normals even while the
      // lens's local analytic shape is sheared or stretched by its spring.
      const normalView = normalize(this.normalToView.mul(normal));
      const insideView = refract(viewDirection, normalView, this.eta).toVar();
      const inside = this.cameraToLens.mul(vec4(insideView, 0)).xyz.toVar(),
        scaledInside = inside.div(this.radii);
      const travel = max(
        dot(entry.div(this.radii), scaledInside)
          .mul(-2)
          .div(max(dot(scaledInside, scaledInside), 0.00001)),
        0,
      ).toVar();
      const exit = entry.add(inside.mul(travel)).toVar();
      const exitNormal = normalize(exit.div(this.radii.mul(this.radii)));
      const exitView = this.lensToView.mul(vec4(exit, 1)).xyz.toVar();
      const outView = refract(
        insideView,
        normalize(this.normalToView.mul(exitNormal)).negate(),
        this.eta.reciprocal(),
      ).toVar();
      const entryView = this.lensToView.mul(vec4(entry, 1)).xyz;
      const sceneZ = perspectiveDepthToViewZ(
        texture(this.target.depthTexture, st).r,
        this.near,
        this.far,
      );
      // Transparent layers do not write depth. Use a bounded virtual image plane
      // for them, explicitly approximate; real opaque depth controls occlusion.
      const imageZ = max(sceneZ, exitView.z.sub(6));
      const rayLength = max(
        imageZ.sub(exitView.z).div(min(outView.z, -0.05)),
        0,
      );
      const projected = this.projection.mul(
        vec4(exitView.add(outView.mul(rayLength)), 1),
      );
      const safeW = max(projected.w.abs(), 0.0001).mul(
        projected.w.lessThan(0).select(-1, 1),
      );
      const refractedUv = vec2(
        projected.x.div(safeW).mul(0.5).add(0.5),
        projected.y.div(safeW).mul(-0.5).add(0.5),
      ).toVar();
      const border = min(
        min(refractedUv.x, refractedUv.y),
        min(refractedUv.x.oneMinus(), refractedUv.y.oneMinus()),
      );
      const sourceZ = perspectiveDepthToViewZ(
        texture(this.target.depthTexture, refractedUv.clamp(0.001, 0.999)).r,
        this.near,
        this.far,
      );
      const mask = smoothstep(0, 0.025, disc.div(a))
        .mul(smoothstep(0.025, 0.18, travel))
        .mul(smoothstep(0, 0.08, entryDistance))
        .mul(smoothstep(0, 0.12, entryView.z.sub(sceneZ)))
        .mul(smoothstep(0, 0.12, entryView.z.sub(sourceZ)))
        .mul(smoothstep(0.1, 0.5, dot(outView, outView)))
        .mul(smoothstep(0.005, 0.04, border))
        .mul(this.strength)
        .mul(this.visibility)
        .toVar();
      const offset = refractedUv.sub(st).toVar();
      const edgeWeight = smoothstep(0, 0.7, disc.div(a));
      // Screen-space rays cannot recover offscreen color. Bounded displacement
      // and a vanishing grazing contribution avoid folded/duplicated edges.
      const lookup = st.add(
        offset
          .mul(min(1, vec2(0.02).length().div(max(offset.length(), 0.00001))))
          .mul(mask)
          .mul(edgeWeight),
      );
      const bent = texture(this.target.texture, lookup.clamp(0.001, 0.999)).rgb;
      const grazing = max(dot(normalView, viewDirection.negate()), 0)
        .oneMinus()
        .pow(3);
      const highlight = max(dot(normal, normalize(vec3(-0.5, 0.7, 1))), 0).pow(
        24,
      );
      const optical = bent
        .mul(vec3(0.994, 0.999, 1))
        .add(
          vec3(0.015, 0.035, 0.046).mul(
            grazing.mul(0.35).add(highlight.mul(0.08)),
          ),
        );
      return vec4(mix(original.rgb, optical, mask), original.a);
    })();
  }
  async render() {
    if (this.disposed) return;
    if (!this.enabled)
      return this.renderer.renderAsync(this.scene, this.camera);
    const renderer = this.renderer;
    const started = performance.now(),
      dt = document.hidden
        ? 0
        : Math.min((started - this.lastTime) / 1000, 0.05);
    this.lastTime = started;
    this.elapsed += dt;
    if (!this.anchored && this.elapsed >= 6) {
      this.anchor();
      this.anchored = true;
    }
    // Development placement waits for the ordinary opening camera to settle.
    // Keep it invisible before that anchor, rather than visibly teleporting.
    const reveal = Math.min(1, Math.max(0, (this.elapsed - 6) / 0.7));
    this.visibility.value = reveal * reveal * (3 - 2 * reveal);
    this.deformation.update(dt);
    renderer.getDrawingBufferSize(this.size);
    this.target.setSize(this.size.x, this.size.y);
    this.camera.updateMatrixWorld();
    const [x, y] = this.deformation.pull;
    this.translation
      .set(x * 0.38, y * 0.38, 0)
      .applyQuaternion(this.rotation)
      .add(this.position);
    this.world.compose(this.translation, this.rotation, this.unit);
    // One-sided grab: centroid moves less than the dragged edge. Mild shear
    // and stretch preserve volume approximately; this is not a full gel field.
    this.shape.set(
      1 + Math.abs(x) * 0.32,
      x * 0.22,
      0,
      0,
      y * 0.18,
      1 + Math.abs(y) * 0.3,
      0,
      0,
      0,
      0,
      1 / (1 + Math.hypot(x, y) * 0.2),
      0,
      0,
      0,
      0,
      1,
    );
    this.world.multiply(this.shape);
    this.inverse.copy(this.world).invert();
    this.cameraToLens.value.multiplyMatrices(
      this.inverse,
      this.camera.matrixWorld,
    );
    this.lensToView.value.multiplyMatrices(
      this.camera.matrixWorldInverse,
      this.world,
    );
    this.normalToView.value.getNormalMatrix(this.lensToView.value);
    this.projection.value.copy(this.camera.projectionMatrix);
    this.inverseProjection.value.copy(this.camera.projectionMatrixInverse);
    this.near.value = this.camera.near;
    this.far.value = this.camera.far;
    if (this.cpu.length < 20000) this.cpu.push(performance.now() - started);
    const previous = renderer.getRenderTarget(),
      toneMapping = renderer.toneMapping,
      colorSpace = renderer.outputColorSpace;
    this.rendering = true;
    try {
      renderer.setRenderTarget(this.target);
      await renderer.renderAsync(this.scene, this.camera);
      renderer.setRenderTarget(previous);
      if (!this.disposed) await this.output.renderAsync();
    } finally {
      renderer.setRenderTarget(previous);
      renderer.toneMapping = toneMapping;
      renderer.outputColorSpace = colorSpace;
      this.rendering = false;
      if (this.disposed) this.releaseResources();
    }
  }
  state() {
    return {
      enabled: this.enabled,
      position: this.position.toArray(),
      radii: this.radii.value.toArray(),
      pull: [...this.deformation.pull],
      dragging: this.deformation.dragging,
      size: [this.target.width, this.target.height],
      samples: this.target.samples,
      format: "RGBA16F + depth24",
      oceanRenders: 1,
      outputPasses: 1,
      backend: this.renderer.backend.isWebGLBackend ? "WebGL2" : "WebGPU",
      textures: this.renderer.info?.memory?.textures,
      legacyOutputTarget: this.renderer._frameBufferTarget
        ? [
            this.renderer._frameBufferTarget.width,
            this.renderer._frameBufferTarget.height,
          ]
        : null,
    };
  }
  releaseResources() {
    if (this.resourcesReleased) return;
    this.resourcesReleased = true;
    this.output.dispose();
    this.target.dispose();
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener("pointerdown", this.onDown, true);
    window.removeEventListener("pointermove", this.onMove, true);
    window.removeEventListener("pointerup", this.onUp, true);
    window.removeEventListener("pointercancel", this.onUp, true);
    window.removeEventListener("blur", this.onHidden);
    document.removeEventListener("visibilitychange", this.onHidden);
    window.removeEventListener("keydown", this.onKey);
    if (!this.rendering) this.releaseResources();
  }
}
