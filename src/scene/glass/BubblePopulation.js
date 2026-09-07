// Bounded, seeded lifecycle only. No renderer, animal changes or camera writes.
const clamp = x => Math.max(0, Math.min(1, x));
export const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const PLUME = Object.freeze({ start: .20, full: .26, exit: .49, end: .56,
  approachSeconds: 4, denseEndSeconds: 18, endSeconds: 23, heroes: 5, ambient: 384 });
export const densityAt = (progress, age) =>
  ease((progress - PLUME.start) / (PLUME.full - PLUME.start)) *
  (1 - ease((progress - PLUME.exit) / (PLUME.end - PLUME.exit))) *
  ease(age / PLUME.approachSeconds) * (1 - ease((age - PLUME.denseEndSeconds) / (PLUME.endSeconds - PLUME.denseEndSeconds)));

// Shared silhouette vocabulary for cheap films and real optical interfaces.
// Multi-frequency, size-dependent deformation; no independent optical wobble.
export function bubbleShape(b, out) {
  const size = b.sizeClass === 'large' ? 1 : b.sizeClass === 'small' ? .10 : .55;
  const q = b.age * b.frequency + b.phase;
  const wobble = (Math.sin(q) * .65 + Math.sin(q * 1.73 + b.phase) * .35) * size;
  out.x = 1 + size * .16 + wobble * .10;
  out.y = 1 - size * .17 - wobble * .08;
  out.z = 1 / (out.x * out.y);
  out.tilt = size * (Math.sin(q * .71) * .16 + Math.sin(q * 1.39) * .055);
  out.shear = size * Math.sin(q * .83 + 1.2) * .07;
  return out;
}

export class BubblePopulation {
  constructor({ seed = 37291, narrow = false } = {}) {
    this.seed = seed >>> 0; this.narrow = narrow;
    this.pool = Array.from({ length: PLUME.ambient + PLUME.heroes }, (_, i) =>
      ({ id: i, hero: i >= PLUME.ambient, live: false, generation: 0,
        x: 0, y: 0, z: 0, age: 0, alpha: 0 }));
    this.time = 0; this.eventAge = 0; this.armed = true; this.running = false;
    this.envelope = 0; this.ambientDebt = 0; this.heroWait = .8; this.accumulator = 0;
    this.flow = { x: 0, y: 0, z: 0 }; this.births = 0; this.eventId = 0;
  }
  random() { this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0; return this.seed / 4294967296; }
  birth(b, place) {
    const size = this.random();
    b.radius = b.hero ? (size < .9 ? .22 + this.random() * .17 : .43 + this.random() * .1)
      : size < .86 ? .028 + this.random() ** 2 * .057 : .10 + this.random() * .10;
    b.sizeClass = b.radius < .09 ? 'small' : b.radius < .43 ? 'medium' : 'large';
    const small = b.sizeClass === 'small';
    b.speed = b.hero ? .72 + this.random() * .35 : small ? 1.25 + this.random() * .65 : .86 + this.random() * .45;
    b.life = b.hero ? 7 + this.random() * 2 : 9 + this.random() * 3;
    b.phase = this.random() * Math.PI * 2; b.frequency = .9 + this.random() * .8;
    b.wobble = (small ? .012 : b.sizeClass === 'large' ? .15 : .075) * (.6 + this.random() * .8);
    b.drift = (this.random() - .5) * .12; b.opacity = .3 + this.random() * .25;
    // Air-like divergent sign, softened optical contrast rather than literal
    // 1.33 water/air (whose grazing TIR needs unavailable reflected scene rays).
    b.eta = 1.035 + this.random() * .025;
    b.spreadX = (this.random() - .5) * (small ? .085 : .14);
    b.spreadZ = (this.random() - .5) * .07;
    b.glint = this.random();
    b.stream = Math.floor(this.random() * 3);
    b.age = 0; b.alpha = 0; b.live = true; b.generation++; this.births++;
    place(b, () => this.random());
  }
  update(delta, progress, field, place) {
    if (!Number.isFinite(delta) || delta <= 0 || delta > .25) return;
    this.accumulator = Math.min(.05, this.accumulator + delta);
    while (this.accumulator >= 1 / 60 - 1e-9) {
      this.step(1 / 60, progress, field, place); this.accumulator -= 1 / 60;
    }
  }
  step(dt, progress, field, place) {
    this.time += dt;
    if (progress < .16 || progress > .60) this.armed = true;
    const inRange = progress > PLUME.start && progress < PLUME.end;
    if (inRange && this.armed && !this.running) {
      this.running = true; this.armed = false; this.eventAge = 0; this.eventId++;
      this.ambientDebt = 0; this.heroWait = .65;
    }
    if (this.running) {
      this.eventAge += dt;
      if (!inRange || this.eventAge >= PLUME.endSeconds) this.running = false;
    }
    const target = this.running ? densityAt(progress, this.eventAge) : 0;
    // Fast scroll exits drain gently, with no ongoing emitter outside the range.
    this.envelope += (target - this.envelope) * (1 - Math.exp(-dt * 3));
    if (this.envelope < .0001 && !this.running) this.envelope = 0;
    if (this.running && target > .001) {
      const packet = .55 + .45 * Math.max(0, Math.sin(this.eventAge * 1.7) + Math.sin(this.eventAge * 2.63 + .8) * .35);
      this.ambientDebt = Math.min(4, this.ambientDebt + target * packet * (this.narrow ? 48 : 82) * dt);
      while (this.ambientDebt >= 1) {
        const b = this.pool.find(b => !b.hero && !b.live);
        if (b) this.birth(b, place);
        this.ambientDebt -= 1;
      }
      this.heroWait -= dt * target;
      if (this.heroWait <= 0) {
        const b = this.pool.find(b => b.hero && !b.live);
        if (b) this.birth(b, place);
        this.heroWait = .85 + this.random() * .65;
      }
    }
    for (const b of this.pool) {
      if (!b.live) continue;
      b.age += dt;
      if (b.age >= b.life || (!this.running && this.envelope === 0)) {
        b.live = false; b.alpha = 0; continue;
      }
      if (field) field.sample(b.x, b.y, b.z, this.flow);
      else this.flow.x = this.flow.y = this.flow.z = 0;
      const spread = Math.min(3, b.age * .4);
      const wander = Math.cos(b.age * b.frequency + b.phase) + Math.sin(b.age * b.frequency * .63 + b.phase * 2) * .4;
      b.x += (b.drift + wander * b.wobble + b.spreadX * spread + this.flow.x * .3) * dt;
      b.y += (b.speed + this.flow.y * .15) * dt;
      b.z += (Math.sin(b.age * b.frequency * .7 + b.phase) * b.wobble + b.spreadZ * spread + this.flow.z * .3) * dt;
      b.alpha = ease(b.age / .55) * ease((b.life - b.age) / 1.2) * this.envelope;
    }
  }
  state() {
    const visible = this.pool.filter(b => b.live && b.alpha > .01);
    return { time: this.time, eventAge: this.eventAge, running: this.running, armed: this.armed,
      envelope: this.envelope, ambient: visible.filter(b => !b.hero).length,
      heroes: visible.filter(b => b.hero).length, births: this.births,
      classes: Object.fromEntries(['small', 'medium', 'large'].map(c => [c, visible.filter(b => b.sizeClass === c).length])),
      eventId: this.eventId, capacity: { ambient: PLUME.ambient, heroes: PLUME.heroes } };
  }
}
