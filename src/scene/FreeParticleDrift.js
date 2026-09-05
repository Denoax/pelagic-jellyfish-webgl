import { DynamicDrawUsage, Vector3 } from "three/webgpu";

const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const smooth = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

// A fixed-size world-space pool. The animal supplies only birth positions;
// existing flecks retain their own position and velocity when it turns/leaves.
export class FreeParticleDrift {
  constructor(mesh) {
    this.mesh = mesh;
    this.positions = mesh.geometry.getAttribute("particleCenter");
    this.alpha = mesh.geometry.getAttribute("particleAlpha");
    this.positions.setUsage(DynamicDrawUsage);
    this.alpha.setUsage(DynamicDrawUsage);
    this.origins = this.positions.array.slice();
    this.velocity = new Float32Array(this.origins.length);
    this.age = new Float32Array(this.positions.count);
    this.life = Float32Array.from(this.age, (_, i) => 15 + hash(i + 9) * 13);
    this.alive = new Uint8Array(this.age.length);
    this.spawnPoint = new Vector3();
    this.initialized = false;
    this.reveal = 0;
    mesh.name = "free-swimming-marine-flecks";
    mesh.visible = false;
  }

  spawn(i, matrix, stagger = false) {
    const j = i * 3;
    this.spawnPoint.fromArray(this.origins, j).multiplyScalar(0.72).applyMatrix4(matrix);
    this.spawnPoint.toArray(this.positions.array, j);
    this.age[i] = stagger ? hash(i + 71) * this.life[i] : 0;
    this.alive[i] = 1;
    this.velocity[j] = (hash(i + 21) - 0.5) * 0.3;
    this.velocity[j + 1] = (hash(i + 31) - 0.4) * 0.2;
    this.velocity[j + 2] = (hash(i + 41) - 0.5) * 0.3;
  }

  update(delta, elapsed, emitterMatrix, emit, current) {
    if (!this.initialized) {
      if (!emit) return;
      for (let i = 0; i < this.age.length; i += 1) this.spawn(i, emitterMatrix, true);
      this.initialized = true;
    }
    const dt = Math.max(0, Math.min(delta, 0.05));
    this.reveal += dt;
    const response = 1 - Math.exp(-dt * 1.1);
    const positions = this.positions.array;
    let visible = false;
    for (let i = 0; i < this.age.length; i += 1) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i] || !this.alive[i]) {
        this.alive[i] = 0;
        this.alpha.array[i] = 0;
        if (!emit) continue;
        this.spawn(i, emitterMatrix);
      }
      const j = i * 3;
      const phase = i * 2.399963;
      const t = elapsed * (0.32 + hash(i + 51) * 0.22);
      // Different smooth headings plus a slow shared current: wandering, not jitter.
      const vx = Math.sin(t + phase) * 0.27 + Math.cos(t * 0.47 + phase * 1.7) * 0.16;
      const vy = Math.cos(t * 0.73 + phase * 1.3) * 0.21 + 0.045;
      const vz = Math.sin(t * 0.61 + phase * 0.9) * 0.3;
      this.velocity[j] += (vx + (current?.x ?? 0) * 0.08 - this.velocity[j]) * response;
      this.velocity[j + 1] += (vy + (current?.y ?? 0) * 0.08 - this.velocity[j + 1]) * response;
      this.velocity[j + 2] += (vz + (current?.z ?? 0) * 0.08 - this.velocity[j + 2]) * response;
      for (let axis = 0; axis < 3; axis += 1) positions[j + axis] += this.velocity[j + axis] * dt;
      this.alpha.array[i] = smooth(this.age[i] / 1.8) * smooth((this.life[i] - this.age[i]) / 4) * smooth(this.reveal / 1.6);
      visible = true;
    }
    this.mesh.visible = visible;
    this.positions.needsUpdate = true;
    this.alpha.needsUpdate = true;
  }
}
