// Read-only baseline parity probe; requires the recorded baseline in local Git history.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { Object3D, Vector2, Vector3 } from 'three/webgpu';
import { LivingAppendages } from '../src/scene/LivingAppendages.js';

const sha='1b5b83e776de1ccad1038a75a98830ac4fc41184';
const result=spawnSync('git',['show',`${sha}:src/scene/LivingAppendages.js`],{encoding:'utf8'});
if(result.status!==0)throw Error(result.stderr);
const source=result.stdout
  .replace('from "three/webgpu"',`from "${import.meta.resolve('three/webgpu')}"`)
  .replace(/from "\.\/(.*?)"/g,(_,path)=>`from "${new URL(`../src/scene/${path}`,import.meta.url).href}"`);
const {LivingAppendages:Baseline}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const baseline=new Baseline({transformationObject:new Object3D()},0);
const current=new LivingAppendages({transformationObject:new Object3D()},0);
const geometries=['bellGeometry','armGeometry','tentacleGeometry','frillGeometry','ribGeometry','organGeometry'];
const materials=['bellMaterial','armMaterial','tentacleMaterial','frillMaterial','rimMaterial','organMaterial'];
for(let i=1;i<=240;i++){
  for(const animal of [baseline,current]){
    animal.medusa.transformationObject.position.set(Math.sin(i/60)*.1,i/600,0);
    if(i===90)animal.activate(new Vector3(.3,.4,.1));
    animal.update(1/60,i/60,new Vector2(.01,-.02));
  }
  if(i%30===0){
    for(const key of geometries){
      const a=baseline[key],b=current[key];
      for(const name of Object.keys(a.attributes))assert.deepEqual(a.attributes[name].array,b.attributes[name].array,`${key}.${name}, frame ${i}`);
      if(a.index)assert.deepEqual(a.index.array,b.index.array,`${key}.index`);
    }
    for(const key of materials)for(const property of ['opacity','emissiveIntensity','roughness','transmission'])assert.equal(baseline[key][property],current[key][property],`${key}.${property}`);
  }
}
baseline.dispose();current.dispose();
console.log(JSON.stringify({baseline:sha,frames:240,geometryBuffers:'byte-for-byte equal at eight checkpoints',materialResponse:'equal',result:'PASS'}));
