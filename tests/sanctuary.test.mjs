import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sanctuaryLayout,chimneyGeometry,basinGeometry,FLOOR_Y} from '../src/scene/sanctuary/geology.js';
import {VentDynamics,AnimalLight} from '../src/scene/sanctuary/VentDynamics.js';
import {CurrentField} from '../src/scene/ocean/CurrentField.js';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {Scene} from 'three/webgpu';

test('M6 geology and topology repeat exactly without random layout',()=>{
 assert.deepEqual(sanctuaryLayout(),sanctuaryLayout());
 for(const factory of [chimneyGeometry,basinGeometry]){const a=factory(),b=factory();assert.deepEqual(a.attributes.position.array,b.attributes.position.array);assert.ok(a.attributes.position.array.every(Number.isFinite));assert.ok(a.attributes.normal.array.every(Number.isFinite));a.dispose();b.dispose();}
 assert.equal(FLOOR_Y,-15);
});
test('M6 solids remain opaque through reverse progress; resources stable and disposed',()=>{
 const scene=new Scene(),s=new Sanctuary(scene);const initial=s.state();
 for(let i=0;i<300;i++)s.update(i/60,1-i/300);
 assert.equal(s.state().opaque,true);assert.equal(s.state().geometries,initial.geometries);assert.equal(s.state().materials,initial.materials);
 assert.equal(scene.children.length,1);let disposed=0;for(const g of s.geometries)g.addEventListener('dispose',()=>disposed++);
 s.dispose();s.dispose();assert.equal(disposed,initial.geometries);assert.equal(scene.children.length,0);assert.equal(s.animalLight.intensity,0);
});
test('bounded preallocated plume lifecycle, current coupling, resume and fixed-rate parity',()=>{
 const a=new VentDynamics(),b=new VentDynamics(),c=new VentDynamics();
 const field=new CurrentField();a.field=b.field=field;c.field={sample(x,y,z,o){o.x=-.4;o.y=0;o.z=.2;o.light=0;return o;}};
 const storage=a.position;
 for(let i=0;i<600;i++){a.update(1/60);c.update(1/60);if(i%2===0)b.update(1/30);}
 assert.deepEqual(a.position,b.position);assert.notDeepEqual(a.position,c.position);assert.equal(a.position,storage);
 const before=a.position.slice(),time=a.time;a.update(30);a.update(NaN);assert.deepEqual(a.position,before);assert.equal(a.time,time);
 for(let i=0;i<3600;i++)a.update(1/60);
 assert.equal(a.position.length,a.count*3);assert.ok(a.position.every(Number.isFinite));assert.ok(a.alpha.every(v=>v>=0&&v<=.6));assert.ok(a.size.every(v=>v>=0&&v<4));
 for(let i=0;i<a.count;i++)assert.ok(a.age[i]<a.life[i]);
 a.dispose();assert.equal(a.field,null);
});
test('reduced-motion plume continues slowly and never flashes or stops',()=>{
 const a=new VentDynamics({reducedMotion:true}),before=a.position.slice();for(let i=0;i<120;i++)a.update(1/60);assert.notDeepEqual(a.position,before);assert.ok(a.position.every(Number.isFinite));
});
test('one environmental light follows animal presence/activation without mutating it',()=>{
 const tissues=[{presence:1,feature:1,activation:0,medusa:{transformationObject:{position:{x:-4,y:-4,z:-21}}}}];
 const original=structuredClone(tissues),l=new AnimalLight();for(let i=0;i<240;i++)l.update(1/60,tissues);
 assert.equal(l.index,0);assert.ok(l.intensity>0);assert.deepEqual(tissues,original);const steady=l.intensity;
 tissues[0].activation=.6;for(let i=0;i<120;i++)l.update(1/60,tissues);assert.ok(l.intensity>steady);
 tissues[0].presence=0;for(let i=0;i<360;i++)l.update(1/60,tissues);assert.equal(l.index,-1);assert.ok(l.intensity<.001);l.dispose();assert.equal(l.intensity,0);
});
test('M6 keeps approved animal/current/camera/idle/refraction sources byte unchanged',()=>{
 const files=['src/scene/LivingAppendages.js','src/scene/jellyMotion.js','src/scene/ocean/CurrentField.js','src/scene/ocean/ConnectedOcean.js','src/scene/ocean/OceanSnow.js','src/scene/glass/LiveOceanLens.js','src/scene/glass/BubblePassage.js','src/scene/camera/directions.js','src/scene/camera/CameraTrack.js','src/scene/camera/ViewController.js'];
 for(const file of files){const old=spawnSync('git',['show',`aef830b:${file}`],{encoding:'utf8'});assert.equal(old.status,0,file);assert.equal(readFileSync(new URL('../'+file,import.meta.url),'utf8'),old.stdout,file);}
 const environment=readFileSync(new URL('../src/scene/PelagicEnvironment.js',import.meta.url),'utf8');
 assert.doesNotMatch(environment,/Acropora|acropora|createKelp|createVolcanic|lavaBubble|deepReveal/);
 const old=spawnSync('git',['show','aef830b:src/scene/PelagicEnvironment.js'],{encoding:'utf8'}).stdout;
 const school=s=>s.slice(s.indexOf('class DistantJellyField'),s.indexOf('function createParticleLayer'));
 assert.equal(school(environment),school(old));
 const layers=s=>s.slice(s.indexOf('function createParticleLayer'),s.indexOf('function createKelpGeometry')>0?s.indexOf('function createKelpGeometry'):s.indexOf('export class PelagicEnvironment'));
 assert.equal(layers(environment).trim(),layers(old).trim());
 const waterUpdate=s=>s.slice(s.indexOf('    this.frame += 1;',s.indexOf('export class PelagicEnvironment')),s.indexOf('    if (!prewarm && progress > 0.54')>0?s.indexOf('    if (!prewarm && progress > 0.54'):s.indexOf('    this.sanctuary.update'));
 assert.equal(waterUpdate(environment),waterUpdate(old));
});
