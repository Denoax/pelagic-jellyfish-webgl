// Two local pull coordinates, not a fluid solver. Analytic critically damped
// recovery is rate-independent; pauses discard wall-time debt.
export class LensDeformation {
  constructor() {
    this.pull = [0, 0];
    this.velocity = [0, 0];
    this.target = [0, 0];
    this.grab = [0, 0];
    this.dragging = false;
  }
  begin(x, y) {
    this.grab = [x, y];
    this.target = [...this.pull];
    this.dragging = true;
  }
  move(x, y) {
    if (!this.dragging) return;
    const dx = x - this.grab[0],
      dy = y - this.grab[1],
      scale = Math.min(1, 0.65 / Math.max(Math.hypot(dx, dy), 0.00001));
    this.target = [dx * scale, dy * scale];
  }
  release() {
    this.dragging = false;
    this.target = [0, 0];
  }
  update(delta) {
    const dt = Number.isFinite(delta) && delta > 0 ? Math.min(delta, 0.05) : 0,
      omega = this.dragging ? 12 : 5;
    const e = Math.exp(-omega * dt);
    for (let i = 0; i < 2; i++) {
      const x = this.pull[i] - this.target[i],
        v = this.velocity[i],
        b = v + omega * x;
      this.pull[i] = this.target[i] + (x + b * dt) * e;
      this.velocity[i] = (v - omega * b * dt) * e;
      if (
        Math.abs(this.pull[i]) < 1e-7 &&
        Math.abs(this.velocity[i]) < 1e-7 &&
        !this.dragging
      ) {
        this.pull[i] = 0;
        this.velocity[i] = 0;
      }
    }
  }
  reset() {
    this.pull = [0, 0];
    this.velocity = [0, 0];
    this.target = [0, 0];
    this.dragging = false;
  }
}
