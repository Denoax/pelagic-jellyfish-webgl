import * as THREE from 'three/webgpu';
import { createSoftParticles } from '../SoftParticles.js';
import { smooth } from './CurrentField.js';

const hash = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

// Fixed world-space positions, recycled only beyond a zero-opacity boundary.
// The camera never translates the pool, so near particles retain real parallax.
export class OceanSnow {
  constructor(scene, field, camera, mobile = false) {
    this.field = field; this.camera = camera;
    this.sample = { x: 0, y: 0, z: 0, light: 0, wake: 0 };
    this.age = 0;
    this.layers = [
      { count: 64, extent: 9, size: 0.038, opacity: 0.26, color: 0x83becb, near: 0.7 },
      { count: 320, extent: 16, size: 0.025, opacity: 0.23, color: 0x66a5be, near: 4 },
      { count: 400, extent: 27, size: 0.018, opacity: 0.16, color: 0x497997, near: 12 },
    ].map((spec, layerIndex) => {
      const count = mobile ? Math.floor(spec.count * 0.65) : spec.count;
      const position = new Float32Array(count * 3), alpha = new Float32Array(count);
      for (let i = 0; i < count; i++) for (let axis = 0; axis < 3; axis++) {
        position[i * 3 + axis] = camera.position.getComponent(axis) + (hash(i * 3 + axis + 171 * layerIndex) * 2 - 1) * spec.extent;
      }
      const source = new THREE.BufferGeometry();
      source.setAttribute('position', new THREE.BufferAttribute(position, 3));
      source.setAttribute('particleAlpha', new THREE.BufferAttribute(alpha, 1));
      const mesh = createSoftParticles(source, { color: spec.color, size: spec.size, opacity: spec.opacity,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }, 0);
      mesh.name = `connected-marine-snow-${layerIndex}`;
      mesh.geometry.getAttribute('particleCenter').setUsage(THREE.DynamicDrawUsage);
      mesh.geometry.getAttribute('particleAlpha').setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);
      return { ...spec, count, position, alpha, mesh, recycleAge: new Float32Array(count) };
    });
  }

  update(dt) {
    this.age += dt;
    const camera = this.camera.position;
    for (const layer of this.layers) {
      const { position: p, alpha, extent, count } = layer;
      for (let i = 0; i < count; i++) {
        const j = i * 3;
        layer.recycleAge[i] += dt;
        const flow = this.field.sample(p[j], p[j + 1], p[j + 2], this.sample);
        p[j] += flow.x * dt;
        p[j + 1] += (flow.y - 0.012) * dt;
        p[j + 2] += flow.z * dt;
        // A wrap is invisible on both sides. Handles camera jumps in one step.
        for (let axis = 0; axis < 3; axis++) {
          const center = camera.getComponent(axis), offset = p[j + axis] - center;
          if (Math.abs(offset) > extent) {
            p[j + axis] = center + ((offset + extent) % (2 * extent) + 2 * extent) % (2 * extent) - extent;
            layer.recycleAge[i] = 0;
          }
        }
        const dx = p[j] - camera.x, dy = p[j + 1] - camera.y, dz = p[j + 2] - camera.z;
        const distance = Math.hypot(dx, dy, dz);
        const edge = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) / extent;
        const envelope = smooth((1 - edge) / 0.25) * smooth((distance - layer.near) / 4) * smooth(this.age / 2);
        // The same local wake reveals ambient snow as well as the animal's
        // detached flecks. Preserve quiet water and cap overlapping highlights.
        alpha[i] = envelope * smooth(layer.recycleAge[i] / 1.2) * (0.45 + hash(i + 91) * 0.4 + Math.max(flow.wake * 0.9, flow.light * 2.2));
      }
      layer.mesh.geometry.getAttribute('particleCenter').needsUpdate = true;
      layer.mesh.geometry.getAttribute('particleAlpha').needsUpdate = true;
    }
  }

  dispose() {
    this.layers.forEach(({ mesh }) => { mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.dispose(); });
  }
}
