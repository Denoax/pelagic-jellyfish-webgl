import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {Scene} from 'three/webgpu';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {BASALT_FINISH} from '../src/scene/sanctuary/materials.js';
import {pinpointLife} from '../src/scene/sanctuary/VentLife.js';
const base='518db86f0be40ac4273900081b5385a9f8ca25bf';
test('M6.5 changes only sanctuary material and pinpoint selection; geometry and other systems stay locked',()=>{
 const changed=execFileSync('git',['diff',base,'--name-only','--','src'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 assert.ok(changed.every(f=>['src/scene/sanctuary/materials.js','src/scene/sanctuary/VentLife.js'].includes(f)),changed.join('\n'));
 for(const name of ['geology.js','mesoGeology.js','Sanctuary.js','BenthicSediment.js','VentDynamics.js','VentParticles.js','ThermalShimmer.js','atmosphere.js']){
  const path='src/scene/sanctuary/'+name;
  assert.equal(readFileSync(new URL('../'+path,import.meta.url),'utf8'),execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'}));
 }
 assert.ok(Object.isFrozen(BASALT_FINISH));
 assert.ok(BASALT_FINISH.albedo<1&&BASALT_FINISH.ambient<1&&BASALT_FINISH.bounce<1);
 assert.ok(BASALT_FINISH.grainHeight>0&&BASALT_FINISH.grainHeight<.02);
});
test('ten deterministic pinpoints retain embedded original surface anchors and five colony bodies',()=>{
 const s=new Sanctuary(new Scene()),a=s.life.anchored,p=s.life.widePoints;
 assert.equal(a.filaments.length,160);assert.equal(a.shells.length,80);assert.equal(a.points.length,40);
 assert.equal(p.length,10);assert.deepEqual(p,pinpointLife(a.points,a.shells));
 assert.deepEqual(p.filter(x=>x.signature).map(x=>x.site),[0,1,3]);
 for(const x of p){
  const shell=a.shells[x.supportShell];assert.deepEqual(x.anchor,shell.p.map((v,i)=>v+shell.normal[i]*shell.s[1]));assert.ok(x.s[0]<=.036);
  const displacement=x.p.map((v,i)=>v-x.anchor[i]);
  assert.ok(Math.abs(Math.hypot(...displacement)-x.s[0]*.35)<1e-6);
  assert.ok(x.s[1]>Math.hypot(...displacement));
 }
 const meshes=s.solids.map(m=>({m,g:m.geometry,mat:m.material,count:m.count})),before=s.state();
 for(let i=0;i<120;i++)s.update(i/60);
 assert.equal(s.state().extraOceanPasses,0);assert.equal(s.state().geometries,before.geometries);assert.equal(s.state().materials,before.materials);
 meshes.forEach(({m,g,mat,count})=>{assert.equal(m.geometry,g);assert.equal(m.material,mat);assert.equal(m.count,count)});
 assert.equal(s.sediment.count,72);assert.equal(s.meso.length,231);
 let lights=0;s.group.traverse(o=>{if(o.isLight)lights++});assert.equal(lights,0);s.dispose();
});
