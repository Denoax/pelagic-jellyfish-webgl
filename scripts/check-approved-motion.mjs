// Material-only pass guard: the approved animal must keep identical geometry/state.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { Object3D, Vector2, Vector3 } from 'three/webgpu';
import { LivingAppendages } from '../src/scene/LivingAppendages.js';

const sha='c4eaa355a4f0ccdf7ec4b24a73653a9799ca7c56';
const result=spawnSync('git',['show',`${sha}:src/scene/LivingAppendages.js`],{encoding:'utf8'});
if(result.status!==0)throw Error(result.stderr);
const source=result.stdout
  .replace(/from ["']three\/webgpu["']/g,`from "${import.meta.resolve('three/webgpu')}"`)
  .replace(/from ["']\.\/(.*?)["']/g,(_,path)=>`from "${new URL(`../src/scene/${path}`,import.meta.url).href}"`);
const {LivingAppendages:Approved}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const approved=new Approved({transformationObject:new Object3D()},0,{improved:true});
const current=new LivingAppendages({transformationObject:new Object3D()},0,{improved:true});
for(let i=1;i<=720;i++){
  for(const animal of [approved,current]){
    animal.medusa.transformationObject.position.set(Math.sin(i/60)*.1,i/600,0);
    animal.medusa.transformationObject.quaternion.setFromAxisAngle(new Vector3(0,0,1),Math.sin(i/100)*.5);
    if(i===90)animal.activate(new Vector3(.3,.4,.1));
    animal.update(i===300?1.8:1/60,i/60,new Vector2(.01,-.02));
  }
  if(i%30!==0)continue;
  for(const key of ['bellGeometry','armGeometry','tentacleGeometry','filamentGeometry','organGeometry']){
    const a=approved[key],b=current[key];
    for(const name of Object.keys(a.attributes))assert.deepEqual(a.attributes[name].array,b.attributes[name].array,`${key}.${name}, frame ${i}`);
    if(a.index)assert.deepEqual(a.index.array,b.index.array,`${key}.index`);
  }
  for(const key of ['armChains','tentacleChains','filamentChains']){
    assert.deepEqual(approved[key].map(c=>c.particles),current[key].map(c=>c.particles),`${key}, frame ${i}`);
  }
  assert.equal(approved.activation,current.activation);
  assert.deepEqual(approved.group.matrix.elements,current.group.matrix.elements);
}
approved.dispose();current.dispose();
console.log(JSON.stringify({baseline:sha,frames:720,checkpoints:24,geometry:'byte-for-byte equal',appendageState:'exactly equal',activation:'equal',result:'PASS'}));
