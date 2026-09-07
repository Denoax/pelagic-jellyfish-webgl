import test from "node:test";
import assert from "node:assert/strict";
import { BufferGeometry, Float32BufferAttribute, Matrix4, Vector3 } from "three/webgpu";
import { createSoftParticles } from "../src/scene/SoftParticles.js";
import { FreeParticleDrift } from "../src/scene/FreeParticleDrift.js";
import { execFileSync } from 'node:child_process';

function pool() {
  const source = new BufferGeometry();
  source.setAttribute("position", new Float32BufferAttribute(Array.from({ length: 90 }, (_, i) => Math.sin(i) * 2), 3));
  source.setAttribute("particleAlpha", new Float32BufferAttribute(new Float32Array(30), 1));
  const mesh = createSoftParticles(source, { size: 0.02, transparent: true, opacity: 0.3 }, 0);
  return new FreeParticleDrift(mesh);
}
const dispose = (p) => { p.mesh.geometry.dispose(); p.mesh.material.dispose(); };

test('connected flecks reveal a local wake without stacking click brightness or changing advection', () => {
  const calm = pool(), wake = pool(), click = pool(), overlap = pool();
  const pools = [calm, wake, click, overlap];
  const fields = [{wake:0,light:0},{wake:.5,light:0},{wake:0,light:1},{wake:.5,light:1}];
  pools.forEach((p,i)=>p.setCurrentField({sample(_x,_y,_z,out){return Object.assign(out,{x:.1,y:.02,z:-.04},fields[i]);}}));
  for(let i=0;i<180;i++)pools.forEach(p=>p.update(1/60,i/60,new Matrix4(),true));
  for(let i=0;i<30;i++){
    assert.ok(Math.abs(wake.alpha.array[i]/calm.alpha.array[i] - (.16+.5*1.4)/.16)<1e-5);
    assert.equal(overlap.alpha.array[i],click.alpha.array[i]);
    assert.ok(overlap.alpha.array[i]<=2.06);
  }
  pools.slice(1).forEach(p=>assert.deepEqual(p.positions.array,calm.positions.array));
  fields.forEach(f=>Object.assign(f,{wake:0,light:0}));
  pools.forEach(p=>p.update(1/60,3,new Matrix4(),true));
  pools.slice(1).forEach(p=>assert.deepEqual(p.alpha.array,calm.alpha.array));
  pools.forEach(dispose);
});

test("existing particles ignore an emitter's translation, rotation and scale", () => {
  const a = pool(); const b = pool();
  const identity = new Matrix4();
  a.update(1 / 60, 0, identity, true);
  b.update(1 / 60, 0, identity, true);
  const moved = new Matrix4().makeRotationY(2).scale(new Vector3(3, 3, 3)).setPosition(100, 200, 300);
  a.update(1 / 60, 1 / 60, identity, false);
  b.update(1 / 60, 1 / 60, moved, false);
  assert.deepEqual(a.positions.array, b.positions.array);
  dispose(a); dispose(b);
});

test("flecks travel independently and fade after emission stops", () => {
  const p = pool(); const identity = new Matrix4();
  p.update(1 / 60, 0, identity, true);
  const before = p.positions.array.slice();
  for (let i = 1; i <= 180; i++) p.update(1 / 60, i / 60, identity, false);
  const travel = Array.from({ length: 30 }, (_, i) => Math.hypot(...[0, 1, 2].map(axis => p.positions.array[i * 3 + axis] - before[i * 3 + axis])));
  assert.ok(travel.filter(distance => distance > 0.15).length > 20);
  assert.ok(Math.max(...p.velocity) > 0.1 && Math.min(...p.velocity) < -0.1);
  for (let i = 181; i <= 1900; i++) p.update(1 / 60, i / 60, identity, false);
  assert.equal(p.mesh.visible, false);
  assert.ok(p.alpha.array.every(value => value === 0));
  assert.ok(p.positions.array.every(Number.isFinite));
  dispose(p);
});

test("replacement flecks are born invisibly at the new emitter", () => {
  const p = pool(); const identity = new Matrix4();
  p.update(1 / 60, 0, identity, true);
  p.age.fill(100);
  p.update(1 / 60, 1, new Matrix4().makeTranslation(100, 0, 0), true);
  assert.ok(p.alpha.array.every(value => value === 0));
  assert.ok(Array.from({ length: 30 }, (_, i) => p.positions.array[i * 3]).every(x => x > 98));
  dispose(p);
});

test('default particle buffers retain exact approved M1 behavior without a field', async () => {
  const code = execFileSync('git', ['show', '515fa71d90f423ac97747cb7a60d1d84d446d13b:src/scene/FreeParticleDrift.js'], { encoding: 'utf8' })
    .replace('"three/webgpu"', JSON.stringify(import.meta.resolve('three/webgpu')));
  const { FreeParticleDrift: Before } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const a = pool(), b = new Before(pool().mesh), matrix = new Matrix4();
  for (let i = 0; i < 600; i++) {
    matrix.makeTranslation(Math.sin(i / 60), i / 600, 0);
    const pointer = { x: Math.sin(i), y: Math.cos(i) };
    a.update(1 / 60, i / 60, matrix, true, pointer);
    b.update(1 / 60, i / 60, matrix, true, pointer);
    assert.deepEqual(a.positions.array, b.positions.array);
    assert.deepEqual(a.alpha.array, b.alpha.array);
  }
  dispose(a); dispose(b);
});
