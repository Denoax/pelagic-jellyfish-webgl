import test from 'node:test';
import assert from 'node:assert/strict';
import { Object3D, PerspectiveCamera, Scene, Vector3, Vector2 } from 'three/webgpu';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { CurrentField } from '../src/scene/ocean/CurrentField.js';
import { OceanSnow } from '../src/scene/ocean/OceanSnow.js';
import { ConnectedOcean } from '../src/scene/ocean/ConnectedOcean.js';
import { LivingAppendages } from '../src/scene/LivingAppendages.js';

const zero = { x: 0, y: 0, z: 0 }, up = { x: 0, y: 1, z: 0 };
const sample = () => ({ ...zero, light: 0, wake: 0 });
const advance = (field, seconds, hz = 60) => { for (let i = 0; i < seconds * hz; i++) field.step(1 / hz); };

test('overlapping currents stay finite and bounded, with local disturbances only', () => {
  const f = new CurrentField(), out = sample(), ambient = sample();
  for (let i = 0; i < 80; i++) { f.wake(zero, up, 1, 4, i); f.activate(zero, i); }
  advance(f, 0.5);
  for (let x = -8; x < 8; x += 0.3) for (let y = -4; y < 4; y += 0.7) {
    f.sample(x, y, Math.sin(x), out);
    assert.ok(Object.values(out).every(Number.isFinite));
    assert.ok(Math.hypot(out.x, out.y, out.z) <= 0.65000001);
    assert.ok(out.light >= 0 && out.light <= 1 && out.wake <= 1);
  }
  f.sample(30, 30, 30, out); f.ambient(30, 30, 30, ambient);
  for (const key of ['x', 'y', 'z']) assert.equal(out[key], ambient[key]);
  assert.equal(out.light, 0); assert.equal(out.wake, 0);
});

test('wake leaves its source, persists briefly, and decays completely', () => {
  const f = new CurrentField(); const e = f.wake(zero, up, 1, 0.8, 0);
  advance(f, 1); assert.ok(e.live); assert.ok(Math.hypot(e.x, e.y, e.z) > 0.04);
  assert.ok(f.sample(e.x, e.y, e.z, sample()).wake > 0.1);
  advance(f, 6); assert.equal(f.state().wakes, 0);
  assert.equal(f.sample(e.x, e.y, e.z, sample()).wake, 0);
});

test('activation arrives later farther away, then returns exactly to ambient', () => {
  const f = new CurrentField(); f.activate(zero, 0); advance(f, 0.5);
  assert.ok(f.sample(0, 0, 0, sample()).light > 0.3);
  assert.equal(f.sample(3, 0, 0, sample()).light, 0);
  advance(f, 1.5); assert.ok(f.sample(3, 0, 0, sample()).light > 0.01);
  advance(f, 6); assert.equal(f.state().activations, 0);
  assert.equal(f.sample(3, 0, 0, sample()).light, 0);
});

test('repeat input has fixed capacity, per-source cooldown and complete cleanup', () => {
  const f = new CurrentField();
  for (let i = 0; i < 1000; i++) f.activate(zero, 0);
  assert.equal(f.state().accepted, 1);
  for (let i = 1; i < 1000; i++) { f.activate(zero, i); f.wake(zero, up, 1, 1, i); }
  assert.equal(f.state().activations, 8); assert.equal(f.state().wakes, 32);
  advance(f, 8);
  assert.equal(f.state().activations, 0); assert.equal(f.state().wakes, 0);
});

test('deterministic field and ordinary rate variation; suspension does not catch up', () => {
  const runs = [30, 60, 120].map(hz => {
    const f = new CurrentField(); f.wake(zero, up, 1, 0.8, 0); f.activate(zero, 0); advance(f, 3, hz); return f;
  });
  const a = runs[0].sample(0.3, 0.2, -0.7, sample());
  for (const f of runs.slice(1)) {
    const b = f.sample(0.3, 0.2, -0.7, sample());
    for (const key of Object.keys(a)) assert.ok(Math.abs(a[key] - b[key]) < 0.002);
  }
  const f = runs[1], before = JSON.stringify(f.state());
  for (const dt of [2, 100, Infinity, NaN, -1, 0]) f.step(dt);
  assert.equal(JSON.stringify(f.state()), before);
  const twin = new CurrentField(); twin.wake(zero, up, 1, 0.8, 0); twin.activate(zero, 0); advance(twin, 3);
  assert.deepEqual(f.sample(1, 2, 3, sample()), twin.sample(1, 2, 3, sample()));
});

test('snow is deterministic world-space advection, bounded through camera jumps', () => {
  const scene = new Scene(), camera = new PerspectiveCamera(), f = new CurrentField();
  const snow = new OceanSnow(scene, f, camera);
  assert.equal(snow.layers.reduce((n, l) => n + l.count, 0), 784);
  for (let i = 0; i < 180; i++) { f.step(1 / 60); snow.update(1 / 60); }
  const before = snow.layers[0].position.slice();
  camera.position.x += 0.001; snow.update(0);
  assert.deepEqual(snow.layers[0].position, before, 'camera did not translate the cloud');
  camera.position.set(200, -300, 120); snow.update(1 / 60);
  for (const l of snow.layers) {
    assert.ok(l.position.every(Number.isFinite)); assert.ok(l.alpha.every(a => a >= 0 && a < 4));
    for (let i = 0; i < l.position.length; i++) assert.ok(Math.abs(l.position[i] - camera.position.getComponent(i % 3)) <= l.extent + 0.0001);
  }
  snow.dispose(); assert.equal(scene.children.length, 0);
});

test('approved animal source, anatomy, material and swimming code are untouched', () => {
  const sha = '515fa71d90f423ac97747cb7a60d1d84d446d13b';
  for (const file of ['src/scene/LivingAppendages.js', 'src/scene/anatomy/mantle.js',
    'src/scene/materials/JellyTissue.js', 'src/scene/materials/BioluminescenceMap.js',
    'src/scene/jellyMotion.js', 'src/scene/JellySchoolDirector.js', 'src/scene/PelagicCameraRig.js']) {
    assert.equal(readFileSync(file, 'utf8'), execFileSync('git', ['show', `${sha}:${file}`], { encoding: 'utf8' }), file);
  }
});

test('environment adapter leaves tissue geometry, material and direct activation exactly equal', () => {
  globalThis.window = {};
  const a = new LivingAppendages({ transformationObject: new Object3D() }, 0, { improved: true });
  const b = new LivingAppendages({ transformationObject: new Object3D() }, 0, { improved: true });
  const scene = new Scene(); scene.add(a.group, b.group);
  const adapter = new ConnectedOcean({ scene, camera: new PerspectiveCamera(), plankton: { object: new Object3D() } },
    { layers: [new Object3D()], currentVeil: new Object3D() }, [b], false);
  for (let i = 1; i <= 180; i++) {
    for (const t of [a, b]) { if (i === 30) t.activate(new Vector3(0.3, 0.4, 0.1)); t.update(1 / 60, i / 60, new Vector2()); }
    adapter.update(1 / 60); adapter.afterTissue();
    if (i % 30) continue;
    for (const key of ['bellGeometry', 'armGeometry', 'tentacleGeometry', 'organGeometry']) {
      for (const attr of Object.keys(a[key].attributes)) assert.deepEqual(a[key].attributes[attr].array, b[key].attributes[attr].array);
    }
    assert.equal(a.activation, b.activation);
    assert.equal(a.bell.material.opacity, b.bell.material.opacity);
    assert.deepEqual(a.bell.material.color, b.bell.material.color);
  }
  adapter.dispose(); a.dispose(); b.dispose(); delete globalThis.window;
});

test('one local echo, no timer stacking, no recursive activation, and stale neighbors are skipped', () => {
  globalThis.window = {};
  const make = (index, x) => ({ index, presence: 1, group: new Object3D(), species: { height: 1 },
    medusa: { transformationObject: new Object3D() }, hits: 0, activate(_point, strength) { assert.equal(strength, 0.11); this.hits++; } });
  const tissues = [make(0), make(1), make(2)];
  tissues[1].group.position.x = 1; tissues[2].group.position.x = 2;
  const adapter = new ConnectedOcean({ scene: new Scene(), camera: new PerspectiveCamera(), plankton: { object: new Object3D() } },
    { layers: [], currentVeil: new Object3D() }, tissues, false);
  for (let i = 0; i < 50; i++) adapter.activate(tissues[0], new Vector3());
  assert.equal(adapter.echoes.filter(e => e.tissue).length, 1);
  for (let i = 0; i < 90; i++) adapter.update(1 / 60);
  assert.equal(tissues[1].hits, 1); assert.equal(tissues[2].hits, 0);
  assert.equal(adapter.field.accepted, 1);
  adapter.activate(tissues[0], new Vector3()); tissues[1].group.position.x = 100;
  for (let i = 0; i < 480; i++) adapter.update(1 / 60);
  assert.equal(tissues[1].hits, 1);
  assert.equal(adapter.echoes.filter(e => e.tissue).length, 0);
  assert.equal(adapter.field.state().activations, 0);
  const state = adapter.field.state(); adapter.update(180); assert.deepEqual(adapter.field.state(), state);
  adapter.dispose(); delete globalThis.window;
});
