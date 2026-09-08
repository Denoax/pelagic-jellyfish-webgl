import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { Object3D, Vector2, Vector3 } from 'three/webgpu';
import { PopulationAnimal } from '../src/scene/population/PopulationAnimal.js';
import { sampleSwimCycle } from '../src/scene/jellyMotion.js';

// Immutable approved M4 implementation loaded alongside the candidate. Its
// unchanged core imports resolve to real installed source, not a rewritten mock.
const baseline = 'ece7cc0f26acbd95b8386a02c3e84f2b5efc4f47';
const get = file => execFileSync('git', ['show', `${baseline}:src/scene/population/${file}`], { encoding: 'utf8' });
const url = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const file = relative => new URL(`../src/scene/${relative}`, import.meta.url).href;
const three = import.meta.resolve('three/webgpu');
const surface = url(get('SurfaceLod.js').replaceAll("'three/webgpu'", JSON.stringify(three))
  .replace("'../anatomy/mantle.js'", JSON.stringify(file('anatomy/mantle.js'))));
const animal = url(get('PopulationAnimal.js').replaceAll("'three/webgpu'", JSON.stringify(three))
  .replace("'../LivingAppendages.js'", JSON.stringify(file('LivingAppendages.js')))
  .replace("'./Importance.js'", JSON.stringify(file('population/Importance.js')))
  .replace("'./SurfaceLod.js'", JSON.stringify(surface)));
const ApprovedAnimal = (await import(animal)).PopulationAnimal;

test('M4.1 preserves all approved M4 visible buffers and simulation through tiers, turns and activation', () => {
  for (const id of [0, 11]) {
    const before = new ApprovedAnimal({ transformationObject: new Object3D() }, id, { reference: id === 0 });
    const after = new PopulationAnimal({ transformationObject: new Object3D() }, id, { reference: id === 0 });
    for (let frame = 0; frame < 720; frame++) {
      const time = frame / 60, pixels = frame < 170 ? 18 : frame < 360 ? 60 : frame < 550 ? 170 : 12;
      for (const t of [before, after]) {
        const body = t.medusa.transformationObject;
        body.position.set(Math.sin(time * .3), time * .08, Math.cos(time * .25));
        body.rotation.set(time * .01, time * .04, Math.sin(time * .2) * .1);
        t.medusa.swimKinematics = sampleSwimCycle(time / 4.7);
        t.setPresence(1, .2); t.inspectImportance(pixels, !(frame > 600 && frame < 650), 1 / 60);
        if (frame === 390) t.activate(new Vector3(.2, .4, .1));
        t.update(1 / 60, time, new Vector2(.03, -.02));
      }
      if (frame % 12 === 0) {
        for (const key of ['bell', 'arms', 'tentacles', 'filaments']) {
          const a = before[key].geometry, b = after[key].geometry;
          assert.deepEqual(b.index.array, a.index.array, `${id}:${frame}:${key}:indices`);
          for (const attr of Object.keys(a.attributes)) assert.deepEqual(b.attributes[attr].array, a.attributes[attr].array, `${id}:${frame}:${key}:${attr}`);
        }
        for (const key of ['tentacleChains', 'armChains', 'filamentChains'])
          for (let c = 0; c < before[key].length; c++) for (let p = 0; p < before[key][c].particles.length; p++)
            assert.deepEqual(after[key][c].particles[p], before[key][c].particles[p]);
        assert.equal(after.activation, before.activation); assert.equal(after.detail, before.detail);
      }
    }
    before.dispose(); after.dispose();
  }
});
