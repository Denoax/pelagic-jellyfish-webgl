// Approved improved-tube equations with only static ring/taper terms cached.
// Persistent frames, spine particles, normals and operation order are unchanged.
import { Vector3 } from 'three/webgpu';
const X_AXIS = new Vector3(1, 0, 0), Y_AXIS = new Vector3(0, 1, 0);
const sections = new Map(), bases = new WeakMap();
function section(points, sides) {
  const key = `${points}:${sides}`;
  if (sections.has(key)) return sections.get(key);
  const widths = new Float64Array(points), cos = new Float64Array(sides), sin = new Float64Array(sides);
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1), s = Math.min(1, Math.max(0, t / .06));
    widths[i] = ((.027 * Math.pow(1 - t, .62)) + .002) * (.65 * (s * s * (3 - 2 * s)));
  }
  for (let i = 0; i < sides; i++) { const angle = i / sides * Math.PI * 2; cos[i] = Math.cos(angle); sin[i] = Math.sin(angle); }
  const value = { widths, cos, sin }; sections.set(key, value); return value;
}
export function prepareTubeSampling(chains, sides) {
  for (const c of chains) {
    section(c.particles.length, sides);
    bases.set(c, { angle: c.angle, sin: Math.sin(c.angle), cos: Math.cos(c.angle) });
  }
}
export function sampleTube(tissue, chain, geometry, sides, baseWidth) {
  const positions = geometry.attributes.position.array, normals = geometry.attributes.normal.array;
  const terms = section(chain.particles.length, sides), basis = bases.get(chain);
  tissue.side.set(-basis.sin, 0, basis.cos);
  let pointer = 0;
  for (let i = 0; i < chain.particles.length; i++) {
    const particle = chain.particles[i], previous = chain.particles[Math.max(0, i - 1)].position;
    const next = chain.particles[Math.min(chain.particles.length - 1, i + 1)].position;
    tissue.tangent.copy(next).sub(previous).normalize();
    const reference = Math.abs(tissue.tangent.y) > .88 ? X_AXIS : Y_AXIS;
    tissue.side.addScaledVector(tissue.tangent, -tissue.side.dot(tissue.tangent));
    if (tissue.side.lengthSq() < 1e-8) tissue.side.crossVectors(tissue.tangent, reference);
    tissue.side.normalize(); tissue.binormal.crossVectors(tissue.tangent, tissue.side).normalize();
    const width = terms.widths[i];
    for (let side = 0; side < sides; side++) {
      tissue.normal.copy(tissue.side).multiplyScalar(terms.cos[side]);
      tissue.normal.addScaledVector(tissue.binormal, terms.sin[side]).normalize();
      positions[pointer] = particle.position.x + tissue.normal.x * width * baseWidth;
      normals[pointer++] = tissue.normal.x;
      positions[pointer] = particle.position.y + tissue.normal.y * width * baseWidth;
      normals[pointer++] = tissue.normal.y;
      positions[pointer] = particle.position.z + tissue.normal.z * width * baseWidth;
      normals[pointer++] = tissue.normal.z;
    }
  }
  geometry.attributes.position.needsUpdate = true; geometry.attributes.normal.needsUpdate = true;
}
