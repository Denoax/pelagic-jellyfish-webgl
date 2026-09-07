import { BufferGeometry, BufferAttribute, DynamicDrawUsage, MathUtils } from 'three/webgpu';
import { mantlePoint } from '../anatomy/mantle.js';

const membraneSamples = new Map();
// membraneSection's time-independent terms, in double precision. Same operation
// order as the approved equation; only its single phase-dependent sine is live.
function membraneTerms(count, arm) {
  const key = `${count}:${arm}`;
  if (membraneSamples.has(key)) return membraneSamples.get(key);
  const rows = Array.from({ length: count }, (_, row) => {
    const t = row / (count - 1);
    const width = (.055 + .32 * Math.sin(Math.PI * t) ** .65) * Math.sqrt(Math.max(0, 1 - t ** 8));
    return { t, width, columns: Array.from({ length: 17 }, (_, col) => {
      const u = col / 8 - 1, edge = Math.abs(u);
      return { edge, x: u * width * (1 + .20 * edge * Math.sin(t * 30 - arm)),
        fold: (Math.sin(u * Math.PI * 2 + t * 7 + arm) - Math.sin(t * 7 + arm)) * width * .30
          + Math.sin(t * 30 + u * 2 - arm) * width * .32 * edge * edge };
    }) };
  });
  membraneSamples.set(key, rows); return rows;
}
export function sampleVisibleMembranes(tissue, elapsed, refreshNormals) {
  const g = tissue.armGeometry, positions = g.attributes.position.array;
  const cycle = tissue.medusa.swimKinematics?.cycle ?? elapsed * tissue.pulseRate + tissue.pulseOffset;
  let pointer = 0;
  tissue.armChains.forEach((chain, arm) => {
    tissue.armSide.set(-Math.sin(chain.angle), 0, Math.cos(chain.angle));
    tissue.armAxis.set(Math.cos(chain.angle), 0, Math.sin(chain.angle));
    const rows = membraneTerms(chain.particles.length, arm);
    chain.particles.forEach((particle, row) => {
      const previous = chain.particles[Math.max(0, row - 1)].position;
      const next = chain.particles[Math.min(chain.particles.length - 1, row + 1)].position;
      tissue.tangent.copy(next).sub(previous).normalize();
      if (!row) tissue.side.copy(tissue.armSide);
      tissue.side.addScaledVector(tissue.tangent, -tissue.side.dot(tissue.tangent));
      if (tissue.side.lengthSq() < 1e-8) tissue.side.copy(tissue.armAxis).cross(tissue.tangent);
      tissue.side.normalize(); tissue.binormal.crossVectors(tissue.tangent, tissue.side).normalize();
      const terms = rows[row];
      const flutter = Math.sin(terms.t * 22 - arm * .8 - cycle * .42) * terms.width * .04;
      for (const col of terms.columns) {
        const fold = col.fold + flutter * col.edge;
        positions[pointer++] = particle.position.x + tissue.side.x * col.x + tissue.binormal.x * fold;
        positions[pointer++] = particle.position.y + tissue.side.y * col.x + tissue.binormal.y * fold;
        positions[pointer++] = particle.position.z + tissue.side.z * col.x + tissue.binormal.z * fold;
      }
    });
  });
  g.attributes.position.needsUpdate = true;
  if (refreshNormals) g.computeVertexNormals();
}

// Sample the approved mantle directly. LivingAppendages also evaluates its old
// cap/noise/pigment construction before overwriting it with mantlePoint; that
// invisible legacy work is unnecessary for this all-improved population.
// Position, normal, color and traveling activation parity are tested exactly.
export function sampleVisibleMantle(tissue, shape, current, refreshNormals) {
  const g = tissue.bellGeometry, { rings, segments, stride, totalRings } = g.userData;
  const p = g.attributes.position.array, c = g.attributes.color.array, signal = g.attributes.tissueSignal.array;
  const scratch = tissue.mantleScratch;
  let vertex = 0;
  for (let ring = 0; ring <= totalRings; ring++) {
    const t = Math.min(1, ring / rings);
    const surfaceT = ring <= rings ? t : 1 + (ring - rings) / (totalRings - rings) * .12;
    for (let segment = 0; segment < stride; segment++, vertex++) {
      const angle = (segment / segments) * Math.PI * 2;
      let wave = 0;
      if (tissue.activation !== 0) {
        const d = Math.abs(Math.atan2(Math.sin(angle - tissue.hitAngle), Math.cos(angle - tissue.hitAngle)));
        const distance = Math.sqrt(Math.pow(d / Math.PI, 2) * .62 + Math.pow(t - tissue.hitPolar, 2));
        wave = Math.exp(-Math.pow((distance - tissue.activationAge * .48) / .075, 2)) * tissue.activation;
      }
      mantlePoint(surfaceT, angle, shape, tissue.species.lobes, current, scratch);
      const i = vertex * 3; p[i] = scratch.x; p[i + 1] = scratch.y; p[i + 2] = scratch.z;
      signal[vertex] = wave;
      const light = MathUtils.clamp(wave * 1.6 + tissue.activation * .08 + tissue.hover * .035, 0, 1);
      c[i] = MathUtils.lerp(tissue.baseBellColors[i], tissue.glowColor.r, light);
      c[i + 1] = MathUtils.lerp(tissue.baseBellColors[i + 1], tissue.glowColor.g, light);
      c[i + 2] = MathUtils.lerp(tissue.baseBellColors[i + 2], tissue.glowColor.b, light);
    }
  }
  g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.attributes.tissueSignal.needsUpdate = true;
  if (refreshNormals) {
    g.computeVertexNormals(); const n = g.attributes.normal;
    for (let row = 1; row <= totalRings; row++) {
      const a = row * stride, b = a + segments;
      tissue.normal.fromBufferAttribute(n, a).add(tissue.side.fromBufferAttribute(n, b)).normalize();
      n.setXYZ(a, tissue.normal.x, tissue.normal.y, tissue.normal.z); n.setXYZ(b, tissue.normal.x, tissue.normal.y, tissue.normal.z);
    }
  }
}

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
