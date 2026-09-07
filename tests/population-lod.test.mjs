import test from 'node:test';
import assert from 'node:assert/strict';
import { Object3D, Vector2, Vector3, Scene, PerspectiveCamera } from 'three/webgpu';
import { PopulationDetail } from '../src/scene/population/PopulationDetail.js';
import { projectedDiameter, selectTier, DetailState, biologicalVariation, canInteract } from '../src/scene/population/Importance.js';
import { PopulationAnimal } from '../src/scene/population/PopulationAnimal.js';
import { LivingAppendages } from '../src/scene/LivingAppendages.js';
import { sampleSwimCycle } from '../src/scene/jellyMotion.js';

test('projected CSS diameter follows radius, FOV and resize, not DPR or identity', () => {
  const p = projectedDiameter(1, 10, 900, 60);
  assert.ok(Math.abs(p - 155.88457) < .001);
  assert.equal(projectedDiameter(2, 10, 900, 60), 2 * p);
  assert.equal(projectedDiameter(1, 10, 450, 60), p / 2);
  for (const z of [0, -10, NaN]) assert.equal(projectedDiameter(1, z, 900, 60), 0);
  for (const dpr of [.8, 1, 1.25, 2]) assert.equal(selectTier(projectedDiameter(1, 10, 900, 60)), 2, `DPR ${dpr}`);
  for (let id = 0; id < 40; id++) { assert.equal(selectTier(150), 2); assert.equal(selectTier(8, 2), 0); }
});
test('hysteresis rejects threshold chatter and transitions agree at 30/60/120Hz', () => {
  assert.equal(selectTier(29, 0), 0); assert.equal(selectTier(29, 1), 1);
  assert.equal(selectTier(100, 1), 1); assert.equal(selectTier(100, 2), 2);
  for (const hz of [30, 60, 120]) {
    const s = new DetailState(); s.update(10, true, 1 / hz);
    for (let n = 0; n < hz * 3; n++) s.update(150, true, 1 / hz);
    assert.equal(s.detail, 2);
    const before = s.detail; s.update(8, true, 10); assert.equal(s.detail, before);
    for (let n = 0; n < hz * 3; n++) s.update(8, true, 1 / hz);
    assert.equal(s.detail, 0);
  }
});
test('biological variation is reproducible, bounded, not a random palette; reference remains exact', () => {
  for (let id = 0; id < 100; id++) {
    const v = biologicalVariation(id); assert.deepEqual(v, biologicalVariation(id));
    assert.ok(v.width >= .96 && v.width <= 1.04 && v.height >= .92 && v.height <= 1.08);
    assert.ok(v.armLength >= .94 && v.armLength <= 1.06 && Math.abs(v.organTurn) <= .08);
  }
  assert.deepEqual(biologicalVariation(0, true), { width: 1, height: 1, armLength: 1, organTurn: 0 });
});
test('click eligibility is projected/visible with no ID gate', () => {
  assert.equal(canInteract(45, true, 1), true); assert.equal(canInteract(23, true, 1), false);
  assert.equal(canInteract(180, false, 1), false); assert.equal(canInteract(180, true, .01), false);
});
test('near reference adapter preserves approved buffers, spines and activation exactly', () => {
  const a = new LivingAppendages({ transformationObject: new Object3D() }, 0, { improved: true });
  const b = new PopulationAnimal({ transformationObject: new Object3D() }, 0, { reference: true });
  for (let frame = 0; frame < 180; frame++) {
    for (const t of [a, b]) {
      t.medusa.swimKinematics = sampleSwimCycle(frame / 300);
      if (frame === 60) t.activate(new Vector3(.3, .4, .1));
      t.update(1 / 60, frame / 60, new Vector2(.03, -.01));
    }
    if (frame % 30 === 0) for (const key of ['bellGeometry', 'armGeometry', 'tentacleGeometry', 'filamentGeometry']) {
      assert.deepEqual(b[key].attributes.position.array, a[key].attributes.position.array, key);
      assert.deepEqual(b[key].attributes.normal.array, a[key].attributes.normal.array, `${key} normals`);
    }
  }
  assert.equal(a.activation, b.activation); a.dispose(); b.dispose();
});
test('tier resources are reused through repeated crossings with finite deformations and retained spines', () => {
  const t = new PopulationAnimal({ transformationObject: new Object3D() }, 12);
  const resources = [...t.bellLevels, ...t.armLevels], spines = t.armChains;
  for (let frame = 0; frame < 700; frame++) {
    t.inspectImportance(frame % 300 < 150 ? 180 : 12, true, 1 / 60);
    t.medusa.swimKinematics = sampleSwimCycle(frame / 300);
    t.update(1 / 60, frame / 60, new Vector2());
    if (frame % 50 === 0) {
      for (const g of [t.bell.geometry, t.arms.geometry]) assert.ok(g.attributes.position.array.every(Number.isFinite));
      assert.equal(t.armChains, spines);
    }
  }
  assert.deepEqual([...t.bellLevels, ...t.armLevels], resources);
  assert.ok(resources[0].index.count < resources[1].index.count && resources[1].index.count < resources[2].index.count);
  t.dispose();
});
test('population pool keeps material ownership coherent through assignment and cleanup', () => {
  globalThis.window = {}; globalThis.innerHeight = 900; globalThis.innerWidth = 1280;
  const camera = new PerspectiveCamera(47, 1280 / 900, .1, 48); camera.position.z = 9;
  const scene = new Scene(), tissues = [0, 1].map(i => new PopulationAnimal({ transformationObject: new Object3D() }, i));
  tissues.forEach(t => scene.add(t.group));
  const field = { count: 0, group: new Object3D(), kinematics: [] };
  const controller = new PopulationDetail({ camera, scene }, { distantJellies: field }, tissues, {});
  for (let i = 0; i < 5; i++) {
    controller.beforeTissue(1 / 60);
    tissues.forEach(t => t.update(1 / 60, i / 60, new Vector2())); controller.afterTissue(i / 60);
    tissues.forEach(t => { if (t.halo) assert.equal(t.haloMaterial, t.halo.material); });
  }
  tissues[0].medusa.transformationObject.position.z = -100;
  controller.beforeTissue(1 / 60); tissues.forEach(t => t.update(1 / 60, 1, new Vector2()));
  controller.dispose(); tissues.forEach(t => t.dispose());
  assert.equal(window.__POPULATION__, undefined);
  delete globalThis.window; delete globalThis.innerHeight; delete globalThis.innerWidth;
});
