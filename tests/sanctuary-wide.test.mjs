import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Scene} from 'three/webgpu';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {colonyLayout} from '../src/scene/sanctuary/VentLife.js';
const baseline='685eaf5960251923bc4ae7012f8fd3c8c42bf46d';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const old=p=>execFileSync('git',['show',`${baseline}:${p}`],{encoding:'utf8'});

test('M6.3 preserves geometry, dynamics, plume, optics, animals, camera, UI and idle source',()=>{
 const changed=execFileSync('git',['diff',baseline,'--name-only','--','src'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const allowed=['src/scene/sanctuary/materials.js','src/scene/sanctuary/VentLife.js','src/scene/sanctuary/atmosphere.js','src/vendor/aurelia/background.js'];
 assert.ok(changed.every(f=>allowed.includes(f)),changed.join('\n'));
 for(const f of ['geology.js','Sanctuary.js','VentDynamics.js','VentParticles.js','ThermalShimmer.js'])assert.equal(read('src/scene/sanctuary/'+f),old('src/scene/sanctuary/'+f));
 // Native ESM now imports this shared radiance graph; extension fix only.
 const bg='src/vendor/aurelia/background.js';assert.equal(read(bg),old(bg).replace('"./lights"','"./lights.js"'));
});
test('wide biological accents reuse the exact existing sites and 40 horizontal positions',()=>{
 const c=colonyLayout();assert.equal(c.points.length,40);assert.equal(c.filaments.length,160);assert.equal(c.shells.length,80);
 assert.ok(c.points.every(p=>p.s[0]===.018));
 const s=new Sanctuary(new Scene()),wide=s.life.widePoints;
 assert.equal(wide.filter(p=>p.s[0]===.065).length,15);
 assert.equal(wide.filter(p=>p.s[0]===.018).length,25);
 wide.forEach((p,i)=>{assert.equal(p.p[0],c.points[i].p[0]);assert.equal(p.p[2],c.points[i].p[2]);assert.ok(p.p[1]-c.points[i].p[1]<2.9)});
 s.dispose();
 assert.deepEqual(c,colonyLayout());
 // Only the local point radius changed: all non-accent geometry/layout is locked.
 const source=read('src/scene/sanctuary/VentLife.js');assert.ok(source.includes('y+.045+seed(id,707)*.055'));
 const layout=s=>s.match(/export function colonyLayout\(\)\{[\s\S]*?return\{sites,filaments,shells,points\};\n\}/)[0];
 assert.equal(layout(source),layout(old('src/scene/sanctuary/VentLife.js')));
});
test('sanctuary resources remain constant through current/light updates and teardown',()=>{
 const scene=new Scene(),s=new Sanctuary(scene),before=s.state();
 const meshes=s.solids.map(m=>({name:m.name,count:m.count||1,geometry:m.geometry,material:m.material}));
 for(let i=0;i<120;i++)s.update(i/60);
 const after=s.state();assert.equal(after.geometries,before.geometries);assert.equal(after.materials,before.materials);assert.equal(after.extraOceanPasses,0);
 assert.deepEqual(s.solids.map(m=>({name:m.name,count:m.count||1,geometry:m.geometry,material:m.material})),meshes);
 assert.ok(s.solids.every(m=>m.material.fog===false));
 s.dispose();s.dispose();assert.equal(scene.children.length,0);
});
