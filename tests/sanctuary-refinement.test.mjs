import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PerspectiveCamera,NormalBlending,Scene} from 'three/webgpu';
import {ThermalShimmer} from '../src/scene/sanctuary/ThermalShimmer.js';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {HERO,FLOOR_Y} from '../src/scene/sanctuary/geology.js';
import {directions} from '../src/scene/camera/directions.js';
import {bakeTrack,TrackPlayer} from '../src/scene/camera/CameraTrack.js';

test('mineral grain buffers are bounded and use normal absorption blending',()=>{
 const s=new Sanctuary(new Scene()),g=s.plume.mesh.geometry;
 const arrays=s.plume.dynamicAttributes.map(a=>a.array);
 for(let i=0;i<120;i++)s.update(i/60);
 assert.equal(g.instanceCount,s.sim.smokeCount*s.plume.grains);
 assert.equal(s.plume.mesh.material.blending,NormalBlending);
 for(let i=0;i<arrays.length;i++){assert.equal(arrays[i],s.plume.dynamicAttributes[i].array);assert.ok(arrays[i].every(Number.isFinite));}
 s.dispose();assert.equal(s.thermal.disposed,true);
});
test('thermal domains cull, disable and dispose without creating GPU resources',()=>{
 const t=new ThermalShimmer(),c=new PerspectiveCamera(50,1280/900,.01,1000);
 c.position.set(HERO.x,-1,-28);c.lookAt(HERO.x,-2,-24);
 assert.equal(t.prepare(c),true);t.enabled=false;assert.equal(t.prepare(c),false);
 t.enabled=true;c.lookAt(HERO.x,-1,-50);assert.equal(t.prepare(c),false);
 t.dispose();t.dispose();assert.equal(t.prepare(c),false);
 const src=readFileSync(new URL('../src/scene/sanctuary/ThermalShimmer.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/new THREE\.(RenderTarget|PostProcessing|WebGPURenderer)|renderAsync\(/);
 assert.match(src,/texture\(lens.target.texture/);assert.match(src,/lens.target.depthTexture/);
});
test('one world retains the defining crown in all final portrait tracks',()=>{
 assert.equal(FLOOR_Y,-15);
 for(const d of Object.values(directions)){
  const c=new PerspectiveCamera(d.fov,390/844,.01,1000);new TrackPlayer(bakeTrack(d)).sample(1,c);c.updateMatrixWorld();
  const p=c.position.clone().set(HERO.x,FLOOR_Y+HERO.height,HERO.z).project(c);
  assert.ok(p.x>-.95&&p.x<0,'off-centre crown retained, not a centred/per-viewport layout');assert.ok(p.y>-1&&p.y<1);
 }
});
