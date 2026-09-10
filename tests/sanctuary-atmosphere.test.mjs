import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Scene} from 'three/webgpu';
import {gullyCenter,gullyDepth,floorHeight,basinGeometry,sanctuaryLayout,HERO} from '../src/scene/sanctuary/geology.js';
import {DIFFUSE} from '../src/scene/sanctuary/VentDynamics.js';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {colonyLayout} from '../src/scene/sanctuary/VentLife.js';

test('gully is actual connected terrain relief, localized away from approved outlets',()=>{
 assert.ok(gullyDepth(gullyCenter(-27),-27)>2);
 for(const p of [{x:HERO.x,z:HERO.z},...DIFFUSE])assert.equal(gullyDepth(p.x,p.z),0);
 assert.equal(gullyDepth(50,-27),0);assert.equal(gullyDepth(gullyCenter(10),10),0);
 const g=basinGeometry(),p=g.attributes.position;let recessed=0;
 for(let i=0;i<p.count;i++){
  assert.ok(Math.abs(p.getY(i)-floorHeight(p.getX(i),p.getZ(i)))<.00001);
  if(p.getY(i)<-17)recessed++;
 }
 assert.ok(recessed>0);assert.ok(g.attributes.normal.array.every(Number.isFinite));g.dispose();
});
test('rock families and ecological islands repeat; no life scatter in open abyss',()=>{
 assert.deepEqual(sanctuaryLayout(),sanctuaryLayout());
 const c=colonyLayout();assert.deepEqual(c,colonyLayout());
 for(const a of [...c.filaments,...c.shells,...c.points]){
  assert.ok(c.sites.some(o=>Math.hypot(o.x-a.p[0],o.z-a.p[2])<1.3));
  assert.ok(a.p.every(Number.isFinite));assert.ok(a.s.every(x=>x>0));
 }
});
test('new life shares bounded current, discards background debt, reuses resources',()=>{
 const scene=new Scene(),s=new Sanctuary(scene),initial=s.state();
 s.connect({sample(x,y,z,o){o.x=100;o.y=0;o.z=-100;o.light=0;}},[]);
 for(let i=0;i<240;i++)s.update(i/60);
 const c=s.life.current.value;assert.ok(c.x>0&&c.x<=.4&&c.y<0&&c.y>=-.4);
 const before=c.clone(),time=s.life.time.value;s.life.update(30,time+30,s.field);
 assert.deepEqual(c,before);assert.equal(s.life.time.value,time);
 assert.equal(s.state().geometries,initial.geometries);assert.equal(s.state().materials,initial.materials);
 s.dispose();assert.equal(s.life.disposed,true);assert.equal(scene.children.length,0);
});
test('M6.2 leaves plume, thermal optics, renderer, water and application wiring intact',()=>{
 // HeroScene's sole M6.6.1 input-boundary addition is exact-source checked in idle-input-regression.
 for(const file of ['src/scene/sanctuary/VentDynamics.js','src/scene/sanctuary/VentParticles.js','src/scene/sanctuary/ThermalShimmer.js','src/scene/glass/LiveOceanLens.js','src/scene/PelagicEnvironment.js']){
  assert.equal(readFileSync(new URL('../'+file,import.meta.url),'utf8'),execFileSync('git',['show',`cb46120:${file}`],{encoding:'utf8'}),file);
 }
});
