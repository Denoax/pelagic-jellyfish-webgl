import { BufferGeometry, BufferAttribute, DynamicDrawUsage } from 'three/webgpu';

// Same mantle parameterization and seven rolled-margin rows as the approved
// animal. Only sampling density changes. All resources are allocated once.
export function mantleGrid(rings, segments) {
  const totalRings = rings + 7, stride = segments + 1, count = (totalRings + 1) * stride;
  const g = new BufferGeometry(), uv = new Float32Array(count * 2), indices = [];
  for (const name of ['position', 'normal', 'color']) g.setAttribute(name,
    new BufferAttribute(new Float32Array(count * 3).fill(name === 'color' ? 1 : 0), 3).setUsage(DynamicDrawUsage));
  g.setAttribute('tissueSignal', new BufferAttribute(new Float32Array(count), 1).setUsage(DynamicDrawUsage));
  for (let row = 0; row <= totalRings; row++) for (let col = 0; col <= segments; col++) {
    const a = row * stride + col;
    uv[a * 2] = col / segments; uv[a * 2 + 1] = Math.min(1, row / rings);
    if (row < totalRings && col < segments) {
      if (!row) indices.push(0, a + stride + 1, a + stride);
      else indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride);
    }
  }
  g.setAttribute('uv', new BufferAttribute(uv, 2)); g.setIndex(indices);
  g.userData = { rings, segments, stride, totalRings }; return g;
}

export function armGrid(points) {
  const g = new BufferGeometry(), count = 4 * points * 17, uv = new Float32Array(count * 2), indices = [];
  g.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage));
  for (let arm = 0; arm < 4; arm++) for (let row = 0; row < points; row++) for (let col = 0; col < 17; col++) {
    const a = (arm * points + row) * 17 + col;
    uv[a * 2] = col / 16; uv[a * 2 + 1] = row / (points - 1);
    if (row < points - 1 && col < 16) indices.push(a, a + 17, a + 1, a + 1, a + 17, a + 18);
  }
  g.setAttribute('uv', new BufferAttribute(uv, 2)); g.setIndex(indices); g.userData.points = points; return g;
}

// Collapse a high grid onto the *triangles* of its lower grid, not an alpha
// crossfade. One mesh/draw, one opacity, same pulse and same material throughout.
const mappings = new WeakMap();
function getMapping(high, low, arm) {
  let targets = mappings.get(high);
  if (!targets) { targets = new WeakMap(); mappings.set(high, targets); }
  if (targets.has(low)) return targets.get(low);
  const h = high.userData, l = low.userData;
  const hs = arm ? 17 : h.stride, ls = arm ? 17 : l.stride;
  const hp = arm ? h.points : h.totalRings + 1, lp = arm ? l.points : l.totalRings + 1;
  const indices = new Uint32Array(high.attributes.position.count * 3), weights = new Float32Array(indices.length);
    for (let i = 0; i < high.attributes.position.count; i++) {
      const body = arm ? Math.floor(i / (hp * hs)) : 0;
      const row = Math.floor(i / hs) % hp, col = i % hs;
      const y = arm ? row / (hp - 1) * (lp - 1) : row <= h.rings ? row / h.rings * l.rings : l.rings + row - h.rings;
      const x = arm ? col : col / h.segments * l.segments;
      const r = Math.min(lp - 2, Math.floor(y)), c = Math.min(ls - 2, Math.floor(x));
      const fy = y - r, fx = x - c, a = (body * lp + r) * ls + c;
      // Both grids use the diagonal from top-right to bottom-left.
      const vertices = fx + fy <= 1 ? [a, a + 1, a + ls] : [a + ls + 1, a + ls, a + 1];
      const blend = fx + fy <= 1 ? [1 - fx - fy, fx, fy] : [fx + fy - 1, 1 - fx, 1 - fy];
      indices.set(vertices, i * 3); weights.set(blend, i * 3);
    }
  const mapping = { indices, weights }; targets.set(low, mapping); return mapping;
}
export function morphSurface(high, low, amount, arm = false) {
  if (amount <= 0) return;
  const { indices, weights } = getMapping(high, low, arm);
  for (const name of ['position', 'normal']) {
    const target = high.attributes[name], source = low.attributes[name];
    for (let i = 0; i < target.count; i++) {
      for (let k = 0; k < 3; k++) {
        let sampled = 0;
        for (let j = 0; j < 3; j++) sampled += source.array[indices[i * 3 + j] * 3 + k] * weights[i * 3 + j];
        target.array[i * 3 + k] += (sampled - target.array[i * 3 + k]) * amount;
      }
    }
    target.needsUpdate = true;
  }
}
