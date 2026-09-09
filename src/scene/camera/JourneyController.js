// One bounded destination follower. Native scrolling requests a destination;
// it cannot bypass the speed/acceleration limits. Fixed integration steps make
// identical input events independent of ordinary rendering cadence.
export const responsePresets = { cinematic: 1.6, balanced: 2.3, responsive: 3 };
export class JourneyController {
  constructor({ maxSpeed = .025, maxAcceleration = .025, response = 'balanced' } = {}) {
    this.maxSpeed = maxSpeed; this.maxAcceleration = maxAcceleration;
    this.response = response; this.position = 0; this.velocity = 0; this.debt = 0;
  }
  suspend() { this.debt = 0; }
  update(target, dt) {
    if (!Number.isFinite(target) || !Number.isFinite(dt) || dt <= 0) return this.position;
    if (dt > .25) { this.suspend(); return this.position; }
    target = Math.max(0, Math.min(1, target));
    this.debt += dt;
    const step = 1 / 240, omega = responsePresets[this.response] || 2.3;
    while (this.debt + 1e-12 >= step) {
      this.debt -= step;
      const acceleration = Math.max(-this.maxAcceleration, Math.min(this.maxAcceleration,
        omega * omega * (target - this.position) - 2 * omega * this.velocity));
      const next = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity + acceleration * step));
      this.position += (this.velocity + next) * .5 * step;
      this.velocity = next;
    }
    return this.position;
  }
}
