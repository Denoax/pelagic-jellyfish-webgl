import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {Vector2,Vector3,Object3D} from 'three/webgpu';
import {PopulationAnimal} from '../src/scene/population/PopulationAnimal.js';
const base='a1fd998eab3a20b4fde99076ecde39058bac2298';
const file='src/scene/HeroScene.jsx';
const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
const old=execFileSync('git',['show',base+':'+file],{encoding:'utf8'});
function fixture(text=source){
 const ctx={Number,window:{innerWidth:1280,innerHeight:900},performance:{now:()=>10},cameraLab:null,app:null,mount:{classList:{remove(){}}},hoveredTissue:null};
 for(const key of ['pointerClient','pointer','pointerNdc','pointerGoal','currentTarget','previousPointer'])ctx[key]=new Vector2(.5,.5);
 runInNewContext(text.slice(text.indexOf('const updatePointer ='),text.indexOf('const findJellyAt ='))+';globalThis.handle=updatePointer;',ctx);
 return ctx;
}
const event=(x,y)=>({clientX:x,clientY:y,target:{},pointerType:'mouse'});
const state=c=>['pointerClient','pointer','pointerNdc','pointerGoal','currentTarget','previousPointer'].map(k=>c[k].toArray());
test('historical activity-only pointer event poisons the original input before any idle transition',()=>{
 const c=fixture(old);c.handle({target:{}});
 assert.ok(state(c).flat().some(v=>!Number.isFinite(v)));
});
test('actual pointer handler rejects missing/nonfinite coordinates before either input branch mutates state',()=>{
 for(const dragging of [false,true])for(const e of [{target:{}},event(NaN,4),event(4,Infinity),event(undefined,0),event('3',2)]){
  const c=fixture();c.cameraLab={dragging};const before=state(c);c.handle(e);assert.deepEqual(state(c),before);
 }
});
test('finite pointer behavior including zero and out-of-viewport coordinates is byte unchanged',()=>{
 const a=fixture(old),b=fixture();
 for(const dragging of[false,true,false])for(const p of[[0,0],[640,450],[1279,899],[-20,920]]){
  a.cameraLab=b.cameraLab={dragging};a.handle(event(...p));b.handle(event(...p));assert.deepEqual(state(b),state(a));
 }
});
test('repeated malformed activity leaves persistent population geometry/material/LOD identical to healthy control',()=>{
 const c=fixture(),control=fixture();
 const make=()=>new PopulationAnimal({transformationObject:new Object3D()},0,{reference:true});
 const pair=[make(),make()],material=pair[0].bellMaterial,map=material.userData.detailMap;
 for(let cycle=0;cycle<25;cycle++){
  c.handle({target:{}}); // historical idle scheduling event: no position sample
  for(let j=0;j<12;j++){
   const f=cycle*12+j,t=f/60;
   if(j===1){const e=event(640+Math.sin(t)*10,450);c.handle(e);control.handle(e);}
   for(const[i,a]of pair.entries()){
    a.medusa.transformationObject.position.set(Math.sin(t*.2),t*.02,0);
    a.medusa.transformationObject.rotation.set(0,t*.05,Math.sin(t)*.1);
    a.setPresence(1,.2);a.inspectImportance([18,70,170][cycle%3],true,1/60);
    if(cycle===12&&j===0)a.activate(new Vector3(.2,.4,.1));
    a.update(1/60,t,i?control.currentTarget:c.currentTarget);
   }
  }
  for(const key of['bell','arms','tentacles','filaments'])for(const[name,attr]of Object.entries(pair[0][key].geometry.attributes)){
   assert.ok(attr.array.every(Number.isFinite),`${cycle}:${key}:${name}`);
   assert.deepEqual(attr.array,pair[1][key].geometry.attributes[name].array);
  }
  assert.equal(pair[0].detail,pair[1].detail);assert.equal(pair[0].bellMaterial,material);assert.equal(material.userData.detailMap,map);
  assert.equal(material.userData.tissueOpacity.value,pair[1].bellMaterial.userData.tissueOpacity.value);
 }
 pair.forEach(a=>a.dispose());
});
test('hotfix changes only the pointer input boundary; approved world/idle/optics remain exact',()=>{
 const changed=execFileSync('git',['diff',base,'--name-only','--','src'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 assert.deepEqual(changed,[file]);
 const addition=`      // Activity-only synthetic events have no spatial sample. Reject them\n      // before touching pointer history/current; undefined coordinates poison\n      // the director and persistent tissue state even before idle begins.\n      if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;\n`;
 assert.ok(source.includes(addition));assert.equal(source.replace(addition,''),old);
});
