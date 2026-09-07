// CSS-pixel coverage, independent of render-buffer DPR/adaptive resolution.
// Identity is deliberately not an input to detail or interaction selection.
export const TIERS = ['far', 'medium', 'near'];
export function projectedDiameter(radius, viewDepth, viewportHeight, verticalFov, zoom = 1) {
  if (![radius, viewDepth, viewportHeight, verticalFov, zoom].every(Number.isFinite)
    || radius <= 0 || viewDepth <= 0 || viewportHeight <= 0 || verticalFov <= 0 || verticalFov >= 180) return 0;
  return Math.min(viewportHeight * 8, radius * viewportHeight * zoom
    / (Math.max(radius * .25, viewDepth) * Math.tan(verticalFov * Math.PI / 360)));
}
export function selectTier(pixels, previous = 0, visible = true) {
  if (!visible || !Number.isFinite(pixels)) return 0;
  if (pixels >= (previous === 2 ? 90 : 110)) return 2;
  if (pixels >= (previous >= 1 ? 24 : 32)) return 1;
  return 0;
}
export function canInteract(pixels, visible, presence) {
  return visible && presence > .15 && pixels >= 24;
}
export class DetailState {
  constructor() { this.tier = 0; this.detail = 0; this.initialized = false; }
  update(pixels, visible, dt) {
    this.tier = selectTier(pixels, this.tier, visible);
    if (!this.initialized) { this.detail = this.tier; this.initialized = true; }
    // No pause debt; a 1.2-second adjacent transition, reversible without a reset.
    const step = Number.isFinite(dt) && dt > 0 && dt <= .25 ? Math.min(dt, .05) / 1.2 : 0;
    this.detail += Math.sign(this.tier - this.detail) * Math.min(Math.abs(this.tier - this.detail), step);
    if (Math.abs(this.detail - this.tier) < 1e-7) this.detail = this.tier;
    return this.detail;
  }
}
export function biologicalVariation(seed, reference = false) {
  const random = salt => {
    let n = Math.imul((seed | 0) ^ salt, 0x45d9f3b);
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  // Reference is an explicit art fixture, NOT a privileged detail tier.
  return Object.freeze({ width: reference ? 1 : .96 + random(19) * .08,
    height: reference ? 1 : .92 + random(31) * .16,
    armLength: reference ? 1 : .94 + random(43) * .12,
    organTurn: reference ? 0 : (random(59) - .5) * .16 });
}
