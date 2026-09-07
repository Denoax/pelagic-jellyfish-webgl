const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const smooth = x => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const event = () => ({ live: false, x: 0, y: 0, z: 0, ax: 0, ay: 1, az: 0, age: 0, life: 0, strength: 0, radius: 1, source: -1 });

// CPU sampling is deliberate: ~2k existing billboard particles, no simulation
// texture, readbacks, allocations per sample, or extra compositing pass.
// Analytic smooth currents + localized vortices; not a physical fluid solver.
export class CurrentField {
  constructor() {
    this.time = 0;
    this.wakes = Array.from({ length: 32 }, event);
    this.activations = Array.from({ length: 8 }, event);
    this.flow = { x: 0, y: 0, z: 0 };
    this.accepted = 0;
  }

  ambient(x, y, z, out) {
    const t = this.time * 0.075;
    // Each component is independent of its own coordinate (divergence-free
    // before local envelopes/velocity limiting, which are artistic controls).
    out.x = 0.055 + 0.085 * Math.sin(y * 0.21 + t) + 0.045 * Math.cos(z * 0.17 - t);
    out.y = 0.025 + 0.055 * Math.sin(z * 0.19 + t * 0.7) + 0.035 * Math.cos(x * 0.18 + t);
    out.z = 0.07 * Math.sin(x * 0.2 - t * 0.8) + 0.04 * Math.cos(y * 0.23 + t);
    return out;
  }

  insert(pool, point, axis, radius, strength, life, source) {
    if (![point.x, point.y, point.z, axis.x, axis.y, axis.z, radius, strength].every(Number.isFinite)) return null;
    const slot = pool.find(e => !e.live) || pool.reduce((old, e) => e.age / e.life > old.age / old.life ? e : old);
    const length = Math.hypot(axis.x, axis.y, axis.z) || 1;
    Object.assign(slot, { live: true, x: point.x, y: point.y, z: point.z,
      ax: axis.x / length, ay: axis.y / length, az: axis.z / length,
      age: 0, life, radius: clamp(radius, 0.4, 3), strength: clamp(strength, 0, 1), source });
    return slot;
  }

  wake(point, axis, radius, strength, source) {
    if (this.wakes.some(e => e.live && e.source === source && e.age < 0.7)) return null;
    return this.insert(this.wakes, point, axis, radius, strength, 5.8, source);
  }

  activate(point, source) {
    if (this.activations.some(e => e.live && e.source === source && e.age < 0.8)) return null;
    const e = this.insert(this.activations, point, { x: 0, y: 1, z: 0 }, 1, 1, 6.4, source);
    if (e) this.accepted++;
    return e;
  }

  step(dt) {
    // Discard suspension time rather than simulating a burst on tab return.
    if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25) return;
    this.time += dt;
    for (const pool of [this.wakes, this.activations]) for (const e of pool) {
      if (!e.live) continue;
      e.age += dt;
      if (e.age >= e.life) { e.live = false; continue; }
      this.ambient(e.x, e.y, e.z, this.flow);
      const downstream = pool === this.wakes ? 0.2 * e.strength : 0;
      e.x += (this.flow.x - e.ax * downstream) * dt;
      e.y += (this.flow.y - e.ay * downstream) * dt;
      e.z += (this.flow.z - e.az * downstream) * dt;
    }
  }

  sample(x, y, z, out) {
    this.ambient(x, y, z, out);
    out.light = 0; out.wake = 0;
    for (const e of this.wakes) {
      if (!e.live) continue;
      const dx = x - e.x, dy = y - e.y, dz = z - e.z;
      const r = e.radius * (1 + e.age * 0.08);
      const d2 = (dx * dx + dy * dy + dz * dz) / (r * r);
      if (d2 >= 4) continue;
      const envelope = smooth(1 - d2 / 4) ** 2 * smooth(e.age / 0.3) * smooth((e.life - e.age) / 3) * e.strength;
      const curl = 0.31 * envelope / r;
      out.x += (e.ay * dz - e.az * dy) * curl - e.ax * 0.23 * envelope;
      out.y += (e.az * dx - e.ax * dz) * curl - e.ay * 0.23 * envelope;
      out.z += (e.ax * dy - e.ay * dx) * curl - e.az * 0.23 * envelope;
      out.wake += envelope;
    }
    for (const e of this.activations) {
      if (!e.live) continue;
      const dx = x - e.x, dy = y - e.y, dz = z - e.z;
      const distance = Math.hypot(dx, dy, dz);
      if (distance >= 5.5) continue;
      // A wide, irregular arrival/decay window, not a thin spherical shell.
      const delay = distance / 1.8 + Math.sin(x * 1.7 + z * 1.1) * 0.12;
      const localAge = e.age - delay;
      const light = smooth(localAge / 0.65) * (1 - smooth((localAge - 0.7) / 2.1))
        * smooth(1 - distance / 5.5) * smooth((e.life - e.age) / 1.2);
      out.light += light * e.strength;
      const push = light * 0.13 / Math.max(0.5, distance);
      out.x += (dx - dz * 0.4) * push;
      out.y += dy * push;
      out.z += (dz + dx * 0.4) * push;
    }
    out.light = clamp(out.light, 0, 1);
    out.wake = clamp(out.wake, 0, 1);
    const speed = Math.hypot(out.x, out.y, out.z);
    if (speed > 0.65) { const s = 0.65 / speed; out.x *= s; out.y *= s; out.z *= s; }
    return out;
  }

  state() {
    return { time: this.time, wakes: this.wakes.filter(e => e.live).length,
      activations: this.activations.filter(e => e.live).length, accepted: this.accepted,
      capacity: { wakes: this.wakes.length, activations: this.activations.length } };
  }
}
