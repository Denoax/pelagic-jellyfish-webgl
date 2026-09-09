// One input-driven follower. No timer/playhead can request travel.
export const responsePresets = { cinematic: 52, balanced: 72, responsive: 92 };
export const WHEEL_LINE_PIXELS = 16;
export const INPUT_SENSITIVITY = .0006; // normalized CSS pixels -> journey units
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export function normalizeWheel(deltaY, deltaMode, viewportHeight) {
  if (!Number.isFinite(deltaY)) return 0;
  return deltaY * (deltaMode === 1 ? WHEEL_LINE_PIXELS : deltaMode === 2 ? Math.max(1, viewportHeight) : 1);
}
export class JourneyController {
  constructor({ maxSpeed = .14, maxAcceleration = 1.4, maxLead = .075, sensitivity = INPUT_SENSITIVITY, response = 'balanced' } = {}) {
    Object.assign(this, { maxSpeed, maxAcceleration, maxLead, sensitivity, response });
    this.position = 0; this.target = 0; this.velocity = 0; this.debt = 0;
    this.acceleration = 0; this.direction = 0; this.leadClamped = false;
  }
  suspend() { this.debt = 0; }
  request(value) {
    if (!Number.isFinite(value)) return;
    const bounded = clamp(value, Math.max(0, this.position - this.maxLead), Math.min(1, this.position + this.maxLead));
    this.leadClamped = Math.abs(value - bounded) > 1e-10;
    this.target = bounded;
  }
  input(pixels) {
    if (!Number.isFinite(pixels) || !pixels) return;
    const direction = Math.sign(pixels);
    // Opposite intent cancels the old queue, not physical camera momentum.
    if (this.direction && direction !== this.direction) this.target = this.position;
    this.direction = direction;
    this.request(this.target + pixels * this.sensitivity);
  }
  seek(value) {
    if (!Number.isFinite(value)) return;
    this.position = this.target = clamp(value, 0, 1);
    this.velocity = this.acceleration = this.debt = this.direction = 0;
  }
  update(_unusedTarget, dt) {
    // Only explicit input/request changes destination; elapsed time is not input.
    if (!Number.isFinite(dt) || dt <= 0) return this.position;
    if (dt > .25) { this.suspend(); return this.position; }
    this.debt += dt;
    const step = 1 / 240, gain = responsePresets[this.response] || responsePresets.balanced;
    while (this.debt + 1e-12 >= step) {
      this.debt -= step;
      const error = this.target - this.position;
      const desired = Math.sign(error) * Math.min(
        this.maxSpeed * Math.tanh(gain * Math.abs(error)),
        Math.sqrt(2 * this.maxAcceleration * Math.abs(error)),
      );
      const previous = this.velocity;
      this.velocity += clamp(desired - previous, -this.maxAcceleration * step, this.maxAcceleration * step);
      this.position += this.velocity * step;
      // Exact rest after subpixel convergence, within one allowed braking step.
      if (Math.abs(this.target - this.position) < 1e-7 && Math.abs(this.velocity) < this.maxAcceleration * step) {
        this.position = this.target; this.velocity = 0;
      }
      this.acceleration = (this.velocity - previous) / step;
    }
    return this.position;
  }
}
