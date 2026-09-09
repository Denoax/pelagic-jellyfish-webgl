import { Euler, Quaternion, Vector3 } from 'three/webgpu';

// Authoring only: one C2 quintic per coordinate, with common knot velocity and
// zero knot acceleration. Monotone harmonic tangents avoid spatial overshoot.
// Static look points are converted to Euler angles here, NEVER tracked live.
const radians = Math.PI / 180;
export function bakeTrack(definition, count = 1201) {
  const keys = definition.poses;
  if (keys.length < 2 || keys[0].s !== 0 || keys.at(-1).s !== 1)
    throw Error('A track needs ordered endpoint poses at 0 and 1');
  const e = new Euler(0, 0, 0, 'YXZ'), q = new Quaternion();
  const values = keys.map((k, i) => {
    if (!Number.isFinite(k.s) || (i && k.s <= keys[i - 1].s)) throw Error('Pose progress must increase');
    const rotation = k.quaternion ? e.setFromQuaternion(q.fromArray(k.quaternion), 'YXZ').toArray().slice(0, 3) : k.rotation.map(v => v * radians);
    const v = [...k.position, ...rotation];
    if (!v.every(Number.isFinite)) throw Error('Non-finite pose');
    return v;
  });
  // Unwrap the authoring angles, then bake hemisphere-continuous quaternions.
  for (let i = 1; i < values.length; i++) for (let axis = 3; axis < 6; axis++) {
    while (values[i][axis] - values[i - 1][axis] > Math.PI) values[i][axis] -= 2 * Math.PI;
    while (values[i][axis] - values[i - 1][axis] < -Math.PI) values[i][axis] += 2 * Math.PI;
  }
  const tangents = values.map((v, i) => v.map((_, axis) => {
    if (!i || i === keys.length - 1) return 0;
    const left = (v[axis] - values[i - 1][axis]) / (keys[i].s - keys[i - 1].s);
    const right = (values[i + 1][axis] - v[axis]) / (keys[i + 1].s - keys[i].s);
    return left * right <= 0 ? 0 : 2 * left * right / (left + right);
  }));
  const data = new Float64Array(count * 7), previous = new Quaternion();
  let segment = 0;
  for (let i = 0; i < count; i++) {
    const s = i / (count - 1);
    while (segment < keys.length - 2 && s > keys[segment + 1].s) segment++;
    const a = segment, b = a + 1, span = keys[b].s - keys[a].s, t = (s - keys[a].s) / span;
    const v = values[a].map((p, axis) => {
      const d = values[b][axis] - p, m = tangents[a][axis] * span, n = tangents[b][axis] * span;
      return p + m * t + (10 * d - 6 * m - 4 * n) * t ** 3 + (-15 * d + 8 * m + 7 * n) * t ** 4 + (6 * d - 3 * m - 3 * n) * t ** 5;
    });
    q.setFromEuler(e.set(v[3], v[4], v[5], 'YXZ'));
    if (i && previous.dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w);
    data.set([...v.slice(0, 3), ...q.toArray()], i * 7); previous.copy(q);
  }
  return { data, count, fov: definition.fov, id: definition.id };
}

export class ProgressSpring {
  constructor(omega = 10) { this.omega = omega; this.position = 0; this.velocity = 0; }
  reset(value = this.position) { this.position = Math.max(0, Math.min(1, value)); this.velocity = 0; }
  update(target, dt) {
    target = Math.max(0, Math.min(1, target));
    if (!Number.isFinite(dt) || dt <= 0) return this.position;
    // Hidden-tab debt is not animation time. Resume from the same pose.
    if (dt > .25) { this.velocity = 0; return this.position; }
    const x = this.position - target, c = this.velocity + this.omega * x, decay = Math.exp(-this.omega * dt);
    this.position = target + (x + c * dt) * decay;
    this.velocity = (this.velocity - this.omega * c * dt) * decay;
    if (this.position < 0 || this.position > 1) this.reset(this.position);
    return this.position;
  }
}

// Allocation-free playback. No target, actor, raycast, noise, FOV or roll spring.
export class TrackPlayer {
  constructor(track) { this.track = track; this.p = new Vector3(); this.q = new Quaternion(); }
  sample(s, camera) {
    const { data, count, fov } = this.track;
    const u = Math.max(0, Math.min(1, s)) * (count - 1), a = Math.min(count - 2, Math.floor(u)), t = u - a;
    camera.position.fromArray(data, a * 7).lerp(this.p.fromArray(data, (a + 1) * 7), t);
    camera.quaternion.fromArray(data, a * 7 + 3).slerp(this.q.fromArray(data, (a + 1) * 7 + 3), t);
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld();
  }
}
